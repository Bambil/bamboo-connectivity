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
const BambooManager = require('./manager')

class BambooBroker extends mosca.Server {
  constructor (options) {
    super(options)

    this.manager = new BambooManager()

    // Agent (Gateway)
    this.on('clientConnected', (client) => {
      let result = client.id.match(/^Bamboo\/(\w+)\/agent\/(\w+)/i)
      if (result && result.length === 3) {
        let tenant = result[1]
        let name = result[2]
        agent.createAgent(name, tenant).then((a) => {
          winston.info(' Adding new agent:')
          a.toString().split('\n').forEach((l) => {
            winston.data(l)
          })

          this.publish({
            topic: `Bamboo/${a.tenant}/agent/${a.name}`,
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

    // Component
    this.on('clientConnected', (client) => {
      let result = client.id.match(/^Bamboo\/(\w+)\/component\/(\w+)/i)
      if (result && result.length === 3) {
        let component = result[1]
        let id = result[2]
        winston.info(` Adding new ${component} with id ${id}`)
      }
    })

    this.on('subscribed', (topic, client) => {
      let result = client.id.match(/^Bamboo\/(\w+)\/component\/(\w+)/i)
      if (result && result.length === 3) {
        let component = result[1]
        let id = result[2]
        this.manager.addComponent(component, id, topic)
        winston.info(` Subscribing on ${topic} from ${component} with id ${id}`)
      }
    })

    this.on('unsubscribed', (topic, client) => {
      let result = client.id.match(/^Bamboo\/(\w+)\/component\/(\w+)/i)
      if (result && result.length === 3) {
        let component = result[1]
        let id = result[2]
        this.manager.removeComponent(component, id, topic)
        winston.info(` UnSubscribing on ${topic} from ${component} with id ${id}`)
      }
    })

    this.on('clientDisconnected', (client) => {
      let result = client.id.match(/^Bamboo\/(\w+)\/component\/(\w+)/i)
      if (result && result.length === 3) {
        let component = result[1]
        let id = result[2]
        winston.info(` Removing ${component} with id ${id}`)
      }
    })

    // Agent (Gateway) + Component
    this.on('published', (packet, client, callback) => {
      if (client) {
        let result = packet.topic.match(/^Bamboo\/(\w+)\/agent\/(\w+)/i)
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
              for (let name in this.manager.channels['Bamboo/log']) {
                let selectedId = Random.pick(Random.engines.browserCrypto, Array.from(this.manager.channels['Bamboo/log'][name]))
                this.publish({
                  topic: `Bamboo/log`,
                  payload: JSON.stringify({
                    data: m.data,
                    id: selectedId,
                    tenant: tenant,
                    name: m.name,
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

module.exports = BambooBroker
