/*
 * +===============================================
 * | Author:        Parham Alvani <parham.alvani@gmail.com>
 * |
 * | Creation Date: 31-08-2017
 * |
 * | File Name:     src/worker.js
 * +===============================================
 */
const BambooBrokerWorker = require('./broker')
const cluster = require('cluster')

if (cluster.isWorker) {
  new BambooBrokerWorker(process.env.mqttPort).run()
}
