/*
 * +===============================================
 * | Author:        Parham Alvani (parham.alvani@gmail.com)
 * |
 * | Creation Date: 11-07-2017
 * |
 * | File Name:     broker.js
 * +===============================================
 */
const mosca = require('mosca')
const winston = require('winston')

const agent = require('./agent')

const pubsubSettings = {
  type: 'mongo',
  url: `mongodb://${process.env.mongo_url}/mqtt`,
  pubsubCollection: 'ascoltatori',
  mongo: {}
}

const moscaSettings = {
  port: 1883,
  backend: pubsubSettings
}

const server = new mosca.Server(moscaSettings)

// fired when the mqtt server is ready
server.on('ready', function () {
  winston.info(` * MQTT at 0.0.0.0:${moscaSettings.port}`)
})

// fired when a client connects
server.on('clientConnected', function (client) {
  let result = client.id.match(/^I1820\/(\w+)\/agent\/(\w+)/i)
  if (result && result.length === 3) {
    let tenant = result[1]
    let name = result[2]
    agent.createAgent(name, tenant).then((a) => {
      winston.data(' Agent:')
      a.toString().split('\n').forEach((l) => {
        winston.data(l)
      })

      server.publish({
        topic: result[0],
        payload: a.hash,
        qos: 0,
        retain: false
      })
    })
  }
})

// fired when a message is received
server.on('published', function (packet, client) {
  if (client) {
    let result = packet.topic.match(/^I1820\/(\w+)\/agent/i)
    if (result && result.length === 2) {
      console.log(packet)
    }
  }
})
