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
if (!process.env.mongo_url) {
  process.env.mongo_url = 'localhost'
}

/* winston.js */
const winston = require('winston')

/* Configure CLI output on the default logger */
winston.cli()

/* Mongoose initiation */
const mongoose = require('mongoose')

mongoose.Promise = global.Promise

mongoose.connect(`mongodb://${process.env.mongo_url}/I1820`, {
  useMongoClient: true
}).then(() => {
  winston.info(' * DB connection was created')
}).catch((err) => {
  winston.error(` * DB connection error: ${err}`)
})

/* Broker */
require('./src/broker')
