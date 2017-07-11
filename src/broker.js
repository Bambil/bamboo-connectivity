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

const agent = require('./agent')

const pubsubSettings = {
  type: 'mongo',
  url: 'mongodb://localhost/mqtt',
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
  console.log(` * MQTT at 0.0.0.0:${moscaSettings.port}`)
})

// fired when a client connects
server.on('clientConnected', function (client) {
  let result = client.id.match(/^I1820\/(\w+)\/agent\/(\w+)/i)
  if (result && result.length === 3) {
    let tenant = result[1]
    let name = result[2]
    let a = agent.createAgent(name, tenant)
    server.publish({
      topic: result[0],
      payload: a.id,
      qos: 0,
      retain: false
    })
  }
})

// fired when a message is received
server.on('published', function (packet, client) {
  if (client) {
    console.log('Published', packet.topic, client.id)
  }
})
