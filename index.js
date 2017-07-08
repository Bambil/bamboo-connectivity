/*
 * +===============================================
 * | Author:        Parham Alvani (parham.alvani@gmail.com)
 * |
 * | Creation Date: 09-07-2017
 * |
 * | File Name:     index.js
 * +===============================================
 */
var mosca = require('mosca')

var moscaSettings = {
  port: 1883
}

var server = new mosca.Server(moscaSettings)
server.on('ready', setup)

server.on('clientConnected', function (client) {
  console.log('client connected', client.id)
})

// fired when a message is received
server.on('published', function (packet, client) {
  console.log('Published', packet.payload)
})

// fired when the mqtt server is ready
function setup () {
  console.log('Mosca server is up and running')
}
