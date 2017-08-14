/*
 * +===============================================
 * | Author:        Parham Alvani (parham.alvani@gmail.com)
 * |
 * | Creation Date: 21-07-2017
 * |
 * | File Name:     components.js
 * +===============================================
 */
const winston = require('winston')

class BambooComponents {
  constructor () {
    this.channels = {
      'Bamboo/log': {}
    }
  }

  addComponentSubscription (name, id, channel) {
    if (channel in this.channels) {
      if (name in this.channels[channel]) {
        this.channels[channel][name].add(id)
      } else {
        this.channels[channel][name] = new Set([id])
      }
      winston.info(` > component "${id}" of type ${name} is subscribing on ${channel}`)
    }
  }

  removeComponentSubscription (name, id, channel) {
    if (channel in this.channels) {
      if (name in this.channels[channel]) {
        this.channels[channel][name].delete(id)
      }
    }
  }
}

module.exports = BambooComponents
