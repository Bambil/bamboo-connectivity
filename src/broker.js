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
const Random = require('random-js')

const agent = require('./agent')
const Message = require('./message')
const I1820Manager = require('./manager')

class I1820Broker extends mosca.Server {
  constructor (options) {
    super(options)

    this.manager = new I1820Manager()

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

    this.on('clientConnected', (client) => {
      let result = client.id.match(/^I1820\/(\w+)\/component\/(\w+)/i)
      if (result && result.length === 3) {
        let component = result[1]
        let id = result[2]
        winston.info(` Adding new ${component} with id ${id}`)
      }
    })

    this.on('subscribed', (topic, client) => {
      let result = client.id.match(/^I1820\/(\w+)\/component\/(\w+)/i)
      if (result && result.length === 3) {
        let component = result[1]
        let id = result[2]
        this.manager.addComponent(component, id, topic)
        winston.info(` Subscribing on ${topic} from ${component} with id ${id}`)
      }
    })

    this.on('clientDisconnected', (client) => {
      let result = client.id.match(/^I1820\/(\w+)\/component\/(\w+)/i)
      if (result && result.length === 3) {
        let component = result[1]
        let id = result[2]
        winston.info(` Removing ${component} with id ${id}`)
      }
    })

    this.on('published', (packet, client, callback) => {
      if (client) {
        let result = packet.topic.match(/^I1820\/(\w+)\/agent\/(\w+)/i)
        if (result && result.length === 3) {
          let tenant = result[1]
          let action = result[2]

          if (action === 'ping') {
            let m = Message.fromJSON(packet.payload)
            if (m) {
              agent.pingAgent(m.name, tenant, m.hash)
              winston.info(` ping from ${m.name} @ ${tenant}`)
            }
          } else if (action === 'log') {
            let m = Message.fromJSON(packet.payload)
            if (m && agent.validateAgent(m.name, tenant, m.hash)) {
              winston.info(` log from ${m.name} @ ${tenant}`)
              for (let name in this.manager.channels['I1820/log']) {
                let selectedId = Random.pick(Random.engines.browserCrypto, Array.from(this.manager.channels['I1820/log'][name]))
                this.publish({
                  topic: `I1820/log`,
                  payload: JSON.stringify({
                    data: m.data,
                    id: selectedId,
                    tenant: tenant,
                    hash: m.hash
                  }),
                  qos: 0,
                  retain: false
                })
              }
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

module.exports = I1820Broker
