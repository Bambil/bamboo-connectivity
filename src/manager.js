/*
 * +===============================================
 * | Author:        Parham Alvani (parham.alvani@gmail.com)
 * |
 * | Creation Date: 21-07-2017
 * |
 * | File Name:     manager.js
 * +===============================================
 */

class BambooManager {
  constructor () {
    this.channels = {
      'Bamboo/log': {}
    }
  }

  addComponent (name, id, channel) {
    if (channel in this.channels) {
      if (name in this.channels[channel]) {
        this.channels[channel][name].add(id)
      } else {
        this.channels[channel][name] = new Set([id])
      }
    }
  }

  removeComponent (name, id, channel) {
    if (channel in this.channels) {
      if (name in this.channels[channel]) {
        this.channels[channel][name].remove(id)
      }
    }
  }
}

module.exports = BambooManager
