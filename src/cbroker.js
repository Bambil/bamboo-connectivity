const aedes = require('aedes')()
const net = require('net')
const cluster = require('cluster')
const winston = require('winston')
const EventEmitter = require('events')
const Agent = require('./agent')

class BambooBrokerWorker {
  run () {
    const server = net.createServer(aedes.handle)

    server.listen(process.env.port)

    aedes.on('ping', (packet, client) => {
      console.log(`ping ${client.id} on ${process.pid}`)
    })

    /**
     * Tests new connected client identification against Bamboo agent identification regex
     * and if they match, call onNewAgent
    */
    aedes.on('client', (client) => {
      let result = client.id.match(/^Bamboo\/(\w+)\/agent\/(\w+)/i)
      if (result && result.length === 3) {
        let tenant = result[1]
        let name = result[2]
        this.onNewAgent(tenant, name, client)
      }
    })

    cluster.on('message', (worker, message, handle) => {
    })
  }

  onNewAgent (tenant, name, client) {
    let a = new Agent(tenant, name)
    console.log(`agent ${tenant}/${name} on ${process.pid}`)

    client.publish({
      topic: `Bamboo/${tenant}/agent/${name}`,
      payload: a.hash,
      qos: 0,
      retain: false
    })
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

    cluster.setupMaster({
      exec: './src/cbroker'
    })
  }

  run () {
    winston.info(` * Master ${process.pid} is running`)

    // Fork workers.
    for (let i = 0; i < this.processNumber; i++) {
      cluster.fork({
        port: this.port
      })
    }

    cluster.on('exit', (worker, code, signal) => {
      winston.error(`worker ${worker.process.pid} died`)
    })

    cluster.on('listening', (worker, address) => {
      winston.info(` * Worker ${worker.id} on ${address.port}`)
      this.emit('ready')
    })

    cluster.on('message', (worker, message, handle) => {
    })
  }
}

module.exports = BambooBroker
