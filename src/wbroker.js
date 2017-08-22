/*
 * +===============================================
 * | Author:        Parham Alvani <parham.alvani@gmail.com>
 * |
 * | Creation Date: 19-08-2017
 * |
 * | File Name:     src/wbroker.js
 * +===============================================
 */
const aedes = require('aedes')()
const net = require('net')
const cluster = require('cluster')

const Agent = require('./agent')
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
   * Fires agent deletaion event
   */
  onAgentDeletation (tenant, name, client) {
    process.send({
      type: 'agentDeletation',
      tenant,
      name
    })
  }

  /**
   * Fires component disconnection event
   */
  onComponentDisconnection (component, id) {
    process.send({
      type: 'componentDisconnection',
      component,
      id
    })
  }

  /**
   * Fires component subscription event
   */
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

  /**
   * Fires component unsubscription event
   */
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

  /**
   * Fires `log` and `discovery` messages event
   */
  onMessage (tenant, action, message) {
    if (action === 'log') {
      process.send({
        type: 'log',
        tenant,
        message
      })
    }
    if (action === 'discovery') {
      process.send({
        type: 'agentThings',
        tenant,
        message
      })
    }
  }
}

if (cluster.isWorker) {
  new BambooBrokerWorker().run()
}
