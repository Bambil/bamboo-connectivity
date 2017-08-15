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
const config = require('config')

/* winston.js */
const winston = require('winston')

/* Configure CLI output on the default logger */
winston.cli()
winston.info(' * 18.20 at Sep 07 2016 7:20 IR721')

/* Broker Cluster */
const BambooBroker = require('./src/cbroker')

new BambooBroker(
  config.broker.port,
  config.broker.processes
).on('ready', () => {
  winston.info(` * MQTT at 0.0.0.0:${config.broker.port}`)
}).run()
