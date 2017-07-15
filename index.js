/*
 * +===============================================
 * | Author:        Parham Alvani (parham.alvani@gmail.com)
 * |
 * | Creation Date: 09-07-2017
 * |
 * | File Name:     index.js
 * +===============================================
 */
const mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/I1820', {
  useMongoClient: true
}).then(() => {
  console.log('db connection was created')
}).catch((err) => {
  console.log(`db connection error: ${err}`)
})
