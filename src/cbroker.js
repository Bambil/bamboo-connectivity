const aedes = require('aedes')
const net = require('net')
const cluster = require('cluster')
const winston = require('winston')
const EventEmitter = require('events')

if (cluster.isWorker) {
  const server = net.createServer(aedes.handle)

  server.listen(process.env.port, () => {
  })
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
  }
}

module.exports = BambooBroker
