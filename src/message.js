/*
 * +===============================================
 * | Author:        Parham Alvani (parham.alvani@gmail.com)
 * |
 * | Creation Date: 28-06-2017
 * |
 * | File Name:     message.js
 * +===============================================
 */

class Message {
  static version () {
    return '2.3'
  }

  constructor (hash, name, data) {
    this.hash = hash
    this.name = name
    this.data = data
  }

  toJSON () {
    return {
      version: Message.version(),
      hash: this.hash,
      name: this.name,
      data: this.data
    }
  }

  static fromJSON (payload) {
    let p = JSON.parse(payload)
    if (p.version !== Message.version()) {
      return null
    }
    return new Message(p.hash, p.name, p.data)
  }
}

module.exports = Message
