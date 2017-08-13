const aedes = require('aedes')
const cluster = require('cluster')

class BambooBroker {
  constructor (processNumber) {
    this.processNumber = processNumber
  }

  run () {
    if (cluster.isMaster) {
      console.log(`Master ${process.pid} is running`)

      // Fork workers.
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
      }

      cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`)
      })

    } else {
    }
  }
}

module.exports = BambooBroker
