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
  construcotr (hash, thingId, name, data) {
    this.hash = hash
    this.thingId = thingId
    this.name = name
    this.data = data
  }

  toJSON () {
    return JSON.stringify({
      hash: this.hash,
      thingId: this.thingId,
      name: this.name,
      data: this.data
    })
  }

  static fromJSON (payload) {
    let p = JSON.parse(payload)
    return new Message(p.hash, p.thingId, p.name, p.data)
  }
}

module.exports = Message
