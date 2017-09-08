/*
 * +===============================================
 * | Author:        Parham Alvani <parham.alvani@gmail.com>
 * |
 * | Creation Date: 25-08-2017
 * |
 * | File Name:     src/master.js
 * +===============================================
 */
const cluster = require('cluster')
const EventEmitter = require('events')

const BambooComponents = require('./components')
const logger = require('./logger')

class BambooMaster extends EventEmitter {
  constructor (mqttPort, coapPort, processNumber) {
    super()
    this.mqttPort = mqttPort
    this.coapPort = coapPort
    this.processNumber = processNumber
    this.components = new BambooComponents()
    this.workers = []

    cluster.setupMaster({
      exec: './src/worker'
    })
  }

  run () {
    // Fork workers.
    for (let i = 0; i < this.processNumber; i++) {
      this.workers.push(cluster.fork({
        mqttPort: this.mqttPort,
        coapPort: this.coapPort
      }))
    }

    cluster.on('exit', (worker, code, signal) => {
      logger.log('error', `worker ${worker.process.pid} died`)
    })

    cluster.on('listening', (worker, address) => {
      this.emit('ready', worker, address)
    })

    cluster.on('message', (worker, message, handle) => {
      if (message.type === 'componentSubscription') {
        this.components.addComponentSubscription(message.component, message.id, message.channel)
      }
      if (message.type === 'componentUnsubscription') {
        this.components.removeComponentSubscription(message.component, message.id, message.channel)
      }
      if (message.type === 'componentDisconnection') {
        this.components.removeComponent(message.component, message.id)
      }
      if (message.type === 'agentCreation') {
        this.onAgentCreation(message.tenant, message.name)
      }
      if (message.type === 'agentDeletation') {
        this.onAgentDeletation(message.tenant, message.name)
      }
      if (message.type === 'agentThings') {
        this.onAgentThings(message.tenant, message.message)
      }
      if (message.type === 'log') {
        this.onLog(message.tenant, message.message)
      }
      if (message.type === 'conf') {
        this.onConf(message.component, message.id, message.message)
      }
    })
  }

  fork () {
    this.workers.push(cluster.fork({
      mqttPort: this.mqttPort,
      coapPort: this.coapPort
    }))
  }

  onLog (tenant, message) {
    let selectedIds = this.components.pickComponents('Bamboo/log')
    for (let selectedId of selectedIds) {
      this.workers.forEach((worker) => {
        worker.send({
          topic: `Bamboo/log`,
          payload: JSON.stringify({
            data: message.data,
            id: selectedId,
            tenant: tenant,
            name: message.name,
            hash: message.hash
          }),
          qos: 0,
          retain: false
        })
      })
    }
  }

  onConf (component, id, message) {
    this.workers.forEach((worker) => {
      worker.send({
        topic: `Bamboo/${message.tenant}/agent/conf`,
        payload: JSON.stringify({
          data: message.data,
          name: message.name,
          hash: message.hash
        }),
        qos: 0,
        retain: false
      })
    })
  }

  onAgentCreation (tenant, name) {
    let selectedIds = this.components.pickComponents('Bamboo/discovery')
    for (let selectedId of selectedIds) {
      this.workers.forEach((worker) => {
        worker.send({
          topic: `Bamboo/discovery`,
          payload: JSON.stringify({
            id: selectedId,
            tenant: tenant,
            name: name,
            type: 'add'
          }),
          qos: 0,
          retain: false
        })
      })
    }
  }

  onAgentDeletation (tenant, name) {
    let selectedIds = this.components.pickComponents('Bamboo/discovery')
    for (let selectedId of selectedIds) {
      this.workers.forEach((worker) => {
        worker.send({
          topic: `Bamboo/discovery`,
          payload: JSON.stringify({
            id: selectedId,
            tenant: tenant,
            name: name,
            type: 'remove'
          }),
          qos: 0,
          retain: false
        })
      })
    }
  }

  onAgentThings (tenant, message) {
    let selectedIds = this.components.pickComponents('Bamboo/discovery')
    for (let selectedId of selectedIds) {
      this.workers.forEach((worker) => {
        worker.send({
          topic: `Bamboo/discovery`,
          payload: JSON.stringify({
            id: selectedId,
            tenant: tenant,
            name: message.name,
            things: message.data.things,
            type: 'things'
          }),
          qos: 0,
          retain: false
        })
      })
    }
  }
}

module.exports = BambooMaster
