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

const AgentSchema = new mongoose.Schema({
  name: String,
  tenant: String
})

class AgentClass {
}

AgentSchema.loadClass(AgentClass)
const Agent = mongoose.model('Agent', AgentSchema)

module.exports = {
  createAgent: function (name, tenant) {
    return new Agent({name, tenant})
  }
}
