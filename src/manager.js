/*
 * +===============================================
 * | Author:        Parham Alvani (parham.alvani@gmail.com)
 * |
 * | Creation Date: 21-07-2017
 * |
 * | File Name:     manager.js
 * +===============================================
 */

class I1820Manager {
  constructor () {
    this.channels = {
      'I1820/log': {}
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
}

module.exports = I1820Manager
