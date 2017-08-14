const aedes = require('aedes')()
const net = require('net')
const cluster = require('cluster')
const winston = require('winston')
const EventEmitter = require('events')

class BambooBrokerWorker {
  run () {
    const server = net.createServer(aedes.handle)

    server.listen(process.env.port)

    aedes.on('ping', (packet, client) => {
      console.log(`ping ${client.id} on ${process.pid}`)
    })

    cluster.on('message', (worker, message, handle) => {
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
