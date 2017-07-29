/*
 * +===============================================
 * | Author:        Parham Alvani (parham.alvani@gmail.com)
 * |
 * | Creation Date: 09-07-2017
 * |
 * | File Name:     index.js
 * +===============================================
 */
/* Configuration */
if (!process.env.BAMBOO_MONGO_URL) {
  process.env.BAMBOO_MONGO_URL = 'localhost'
}

if (!process.env.BAMBOO_BROKER_PORT) {
  process.env.BAMBOO_BROKER_PORT = 1883
}

/* winston.js */
const winston = require('winston')

/* Configure CLI output on the default logger */
winston.cli()
winston.info(' * 18.20 at Sep 07 2016 7:20 IR721')

/* Mongoose initiation */
const mongoose = require('mongoose')

mongoose.Promise = global.Promise

mongoose.connect(`mongodb://${process.env.BAMBOO_MONGO_URL}/bamboo`, {
  useMongoClient: true
}).then(() => {
  winston.info(' * DB connection was created')
}).catch((err) => {
  winston.error(` * DB connection error: ${err}`)
})

/* Broker Cluster */
const BambooBroker = require('./src/broker')
const cluster = require('cluster')

if (cluster.isMaster) {
  winston.info(` * MQTT Master is running`)

  for (let i = 0; i < require('os').cpus().length; i++) {
    cluster.fork()
  }
} else {
  new BambooBroker(
    {
      port: 1883,
      backend: {
        type: 'mongo',
        url: `mongodb://${process.env.BAMBOO_MONGO_URL}/mqtt`,
        pubsubCollection: 'ascoltatori',
        mongo: {}
      }
    }
  ).on('ready', () => {
    winston.info(` * MQTT at 0.0.0.0:${process.env.BAMBOO_BROKER_PORT}`)
  })
}
