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
if (!process.env.I1820_MONGO_URL) {
  process.env.I1820_MONGO_URL = 'localhost'
}

if (!process.env.I1820_BROKER_PORT) {
  process.env.I1820_BROKER_PORT = 1883
}

/* winston.js */
const winston = require('winston')

/* Configure CLI output on the default logger */
winston.cli()

/* Mongoose initiation */
const mongoose = require('mongoose')

mongoose.Promise = global.Promise

mongoose.connect(`mongodb://${process.env.I1820_MONGO_URL}/I1820`, {
  useMongoClient: true
}).then(() => {
  winston.info(' * DB connection was created')
}).catch((err) => {
  winston.error(` * DB connection error: ${err}`)
})

/* Broker */
const I1820Broker = require('./src/broker')

new I1820Broker(
  {
    port: 1883,
    backend: {
      type: 'mongo',
      url: `mongodb://${process.env.I1820_MONGO_URL}/mqtt`,
      pubsubCollection: 'ascoltatori',
      mongo: {}
    }
  }
).on('ready', () => {
  winston.info(` * MQTT at 0.0.0.0:${process.env.I1820_BROKER_PORT}`)
})
