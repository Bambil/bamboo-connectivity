/*
 * +===============================================
 * | Author:        Parham Alvani (parham.alvani@gmail.com)
 * |
 * | Creation Date: 09-07-2017
 * |
 * | File Name:     agent.js
 * +===============================================
 */
const crypto = require('crypto')

class Agent {
  constructor (tenant, name) {
    this.tenant = tenant
    this.name = name

    let hmac = crypto.createHmac('sha256', 'kj97')
    hmac.update(this.name)
    hmac.update(this.tenant)
    this.hash = hmac.digest('hex')
  }

  static validateAgent (tenant, name, hash) {
    let hmac = crypto.createHmac('sha256', 'kj97')
    hmac.update(name)
    hmac.update(tenant)
    if (hash === hmac.digest('hex')) {
      return true
    }
    return false
  }
}

module.exports = Agent
