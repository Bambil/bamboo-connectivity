/*
 * +===============================================
 * | Author:        Parham Alvani (parham.alvani@gmail.com)
 * |
 * | Creation Date: 21-07-2017
 * |
 * | File Name:     component.js
 * +===============================================
 */

class I1820Component {
  constructor (name, id) {
    this.name = name
    this.id = id
    this.channels = new Set([])
  }

  subscribe (channel) {
    this.channels.add(channel)
  }
}

module.exports = I1820Component
