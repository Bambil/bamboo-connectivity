/*
 * +===============================================
 * | Author:        Parham Alvani <parham.alvani@gmail.com>
 * |
 * | Creation Date: 30-08-2017
 * |
 * | File Name:     src/coap.js
 * +===============================================
 */
const coap = require('coap')

class BambooCoAPWorker {
  constructor (port) {
    this.port = port
  }

  run () {
    const server = coap.createServer()
    server.listen(this.port)

    server.on('request', (req, res) => {
    })
  }
}

module.exports = BambooCoAPWorker
