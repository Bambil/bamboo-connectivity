/*
 * +===============================================
 * | Author:        Parham Alvani (parham.alvani@gmail.com)
 * |
 * | Creation Date: 11-07-2017
 * |
 * | File Name:     broker.js
 * +===============================================
 */
const winston = require('winston')
const mosca = require('mosca')

const agent = require('./agent')
const Message = require('./message')

class I1820Broker extends mosca.Server {
  constructor (options) {
    super(options)

    this.on('clientConnected', (client) => {
      let result = client.id.match(/^I1820\/(\w+)\/agent\/(\w+)/i)
      if (result && result.length === 3) {
        let tenant = result[1]
        let name = result[2]
        agent.createAgent(name, tenant).then((a) => {
          winston.info(' Adding new agent:')
          a.toString().split('\n').forEach((l) => {
            winston.data(l)
          })

          this.publish({
            topic: `I1820/${a.tenant}/agent/${a.name}`,
            payload: a.hash,
            qos: 0,
            retain: false
          }, (err, p) => {
            if (err) {
              winston.error(err)
              return
            }
            winston.info(' ID to agent:')
            winston.data(p)
          })
        })
      }
    })

    this.on('published', (packet, client, callback) => {
      if (client) {
        let result = packet.topic.match(/^I1820\/(\w+)\/agent\/(\w+)/i)
        if (result && result.length === 3) {
          let tenant = result[1]
          let action = result[2]
          if (action === 'ping') {
            winston.info(packet.payload.toString())
            let m = Message.fromJSON(packet.payload)
            if (m) {
              agent.pingAgent(m.name, tenant, m.hash)
              winston.info(` ping from ${m.name} @ ${tenant}`)
            }
          } else if (action === 'log') {
            let m = Message.fromJSON(packet.payload)
            if (m && agent.validateAgent(m.name, tenant, m.hash)) {
            }
          }
        }
      }
    })
  }

  authenticate (client, username, password, callback) {
    callback(null, true)
  }
}

// fired when a client connects
module.exports = I1820Broker
