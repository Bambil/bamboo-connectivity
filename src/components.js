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
const Random = require('random-js')

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
      winston.info(` > component "${id}" of type ${name} subscribes on ${channel}`)
    }
  }

  removeComponentSubscription (name, id, channel) {
    if (channel in this.channels) {
      if (name in this.channels[channel]) {
        this.channels[channel][name].delete(id)
      }
      winston.info(` > component "${id}" of type ${name} doesn't subscribe on ${channel}`)
    }
  }

  pickComponents (channel) {
    let selectedIds = []
    for (let name in this.channels[channel]) {
      let selectedId = Random.pick(Random.engines.browserCrypto, Array.from(this.channels[channel][name]))
      selectedIds.push(selectedId)
    }
    return selectedIds
  }
}

module.exports = BambooComponents
