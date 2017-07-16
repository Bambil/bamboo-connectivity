/*
 * +===============================================
 * | Author:        Parham Alvani (parham.alvani@gmail.com)
 * |
 * | Creation Date: 09-07-2017
 * |
 * | File Name:     agent.js
 * +===============================================
 */
const mongoose = require('mongoose')
const crypto = require('crypto')

const AgentSchema = new mongoose.Schema({
  name: String,
  tenant: String,
  hash: String,
  lastSeen: Date
})

class AgentClass {
}

AgentSchema.loadClass(AgentClass)
const Agent = mongoose.model('Agent', AgentSchema)

module.exports = {
  createAgent: function (name, tenant) {
    let hmac = crypto.createHmac('sha256', 'kj97')
    hmac.update(name)
    hmac.update(tenant)
    let hash = hmac.digest('hex')
    return Agent.findOneAndUpdate({
      hash
    }, {
      name,
      tenant,
      hash,
      lastSeen: Date.now()
    }, {
      new: true,
      upsert: true
    }).exec()
  }
}
