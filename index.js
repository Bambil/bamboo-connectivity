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

/* Mongoose initiation */
const mongoose = require('mongoose')

mongoose.Promise = global.Promise

mongoose.connect(`mongodb://${process.env.mongo_url}/I1820`, {
  useMongoClient: true
}).then(() => {
  console.log('db connection was created')
}).catch((err) => {
  console.log(`db connection error: ${err}`)
})

/* winston.js */
var winston = require('winston')

/* Configure CLI output on the default logger */
winston.cli()
