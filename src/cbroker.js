const aedes = require('aedes')()
const net = require('net')
const cluster = require('cluster')
const winston = require('winston')
const EventEmitter = require('events')

const Agent = require('./agent')
const BambooComponents = require('./components')
const Message = require('./message')

class BambooBrokerWorker {
  run () {
    const server = net.createServer(aedes.handle)

    server.listen(process.env.port)

    /**
     * Tests new connected client identification against Bamboo agent identification regex
     * and if they match, call onAgentCreation
     */
    aedes.on('client', (client) => {
      let result = client.id.match(/^Bamboo\/(\w+)\/agent\/(\w+)/i)
      if (result && result.length === 3) {
        let tenant = result[1]
        let name = result[2]
        this.onAgentCreation(tenant, name, client)
      }
    })

    aedes.on('subscribe', (topics, client) => {
      let result = client.id.match(/^Bamboo\/(\w+)\/component\/(\w+)/i)
      if (result && result.length === 3) {
        let component = result[1]
        let id = result[2]
        this.onComponentSubscription(component, id, topics)
      }
    })

    aedes.on('unsubscribe', (topics, client) => {
      let result = client.id.match(/^Bamboo\/(\w+)\/component\/(\w+)/i)
      if (result && result.length === 3) {
        let component = result[1]
        let id = result[2]
        this.onComponentUnsubscription(component, id, topics)
      }
    })

    /**
     * Recieves messages from agents, parses them and call onMessage
     */
    aedes.on('publish', (packet, client) => {
      if (client) {
        let result = packet.topic.match(/^Bamboo\/(\w+)\/agent\/(\w+)/i)
        if (result && result.length === 3) {
          let tenant = result[1]
          let action = result[2]
          let message = Message.fromJSON(packet.payload)
          this.onMessage(tenant, action, message)
        }
      }
    })

    /**
     * Detects component disconnection
     */
    aedes.on('clientDisconnect', (client) => {
      let result = client.id.match(/^Bamboo\/(\w+)\/component\/(\w+)/i)
      if (result && result.length === 3) {
        let component = result[1]
        let id = result[2]
        this.onComponentDisconnection(component, id)
      }
    })

    /**
     * Detects agent disconnection
     */
    aedes.on('clientDisconnect', (client) => {
      let result = client.id.match(/^Bamboo\/(\w+)\/agent\/(\w+)/i)
      if (result && result.length === 3) {
        let tenant = result[1]
        let name = result[2]
        this.onAgentDeletation(tenant, name, client)
      }
    })

    process.on('message', (message, handle) => {
      aedes.publish(message)
    })
  }

  /**
   * Creates agent instance and its hash
   */
  onAgentCreation (tenant, name, client) {
    let a = new Agent(tenant, name)

    client.publish({
      topic: `Bamboo/${tenant}/agent/${name}`,
      payload: a.hash,
      qos: 0,
      retain: false
    })

    process.send({
      type: 'agentCreation',
      tenant,
      name
    })
  }

  /**
   * Creates agent instance and its hash
   */
  onAgentDeletation (tenant, name, client) {
    process.send({
      type: 'agentDeletation',
      tenant,
      name
    })
  }

  onComponentDisconnection (component, id) {
    process.send({
      type: 'componentDisconnection',
      component,
      id
    })
  }

  onComponentSubscription (component, id, channels) {
    for (let channel of channels) {
      channel = channel.topic
      process.send({
        type: 'componentSubscription',
        component,
        id,
        channel
      })
    }
  }

  onComponentUnsubscription (component, id, channels) {
    for (let channel of channels) {
      channel = channel.topic
      process.send({
        type: 'componentUnsubscription',
        component,
        id,
        channel
      })
    }
  }

  onMessage (tenant, action, message) {
    if (action === 'log') {
      process.send({
        type: 'log',
        tenant,
        message
      })
    }
  }
}

if (cluster.isWorker) {
  new BambooBrokerWorker().run()
}

class BambooBroker extends EventEmitter {
  constructor (port, processNumber) {
    super()
    this.port = port
    this.processNumber = processNumber
    this.components = new BambooComponents()
    this.workers = []

    cluster.setupMaster({
      exec: './src/cbroker'
    })
  }

  run () {
    // Fork workers.
    for (let i = 0; i < this.processNumber; i++) {
      this.workers.push(cluster.fork({
        port: this.port
      }))
    }

    cluster.on('exit', (worker, code, signal) => {
      winston.error(`worker ${worker.process.pid} died`)
    })

    cluster.on('listening', (worker, address) => {
      this.emit('ready', worker)
    })

    cluster.on('message', (worker, message, handle) => {
      if (message.type === 'componentSubscription') {
        this.components.addComponentSubscription(message.component, message.id, message.channel)
      }
      if (message.type === 'componentUnsubscription') {
        this.components.removeComponentSubscription(message.component, message.id, message.channel)
      }
      if (message.type === 'componentDisconnection') {
        this.components.removeComponent(message.component, message.id)
      }
      if (message.type === 'agentCreation') {
        this.onAgentCreation(message.tenant, message.name)
      }
      if (message.type === 'agentDeletation') {
        this.onAgentDeletation(message.tenant, message.name)
      }
      if (message.type === 'log') {
        this.onLog(message.tenant, message.message)
      }
    })
  }

  fork () {
    this.workers.push(cluster.fork({
      port: this.port
    }))
  }

  onLog (tenant, message) {
    let selectedIds = this.components.pickComponents('Bamboo/log')
    for (let selectedId of selectedIds) {
      this.workers.forEach((worker) => {
        worker.send({
          topic: `Bamboo/log`,
          payload: JSON.stringify({
            data: message.data,
            id: selectedId,
            tenant: tenant,
            name: message.name,
            hash: message.hash
          }),
          qos: 0,
          retain: false
        })
      })
    }
  }

  onAgentCreation (tenant, name) {
    let selectedIds = this.components.pickComponents('Bamboo/discovery')
    for (let selectedId of selectedIds) {
      this.workers.forEach((worker) => {
        worker.send({
          topic: `Bamboo/discovery`,
          payload: JSON.stringify({
            id: selectedId,
            tenant: tenant,
            name: name,
            type: 'add'
          }),
          qos: 0,
          retain: false
        })
      })
    }
  }

  onAgentDeletation (tenant, name) {
    let selectedIds = this.components.pickComponents('Bamboo/discovery')
    for (let selectedId of selectedIds) {
      this.workers.forEach((worker) => {
        worker.send({
          topic: `Bamboo/discovery`,
          payload: JSON.stringify({
            id: selectedId,
            tenant: tenant,
            name: name,
            type: 'remove'
          }),
          qos: 0,
          retain: false
        })
      })
    }
  }
}

module.exports = BambooBroker
