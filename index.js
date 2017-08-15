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

/* Command Line Interface */
const vorpal = require('vorpal')()
const chalk = require('chalk')

vorpal.find('exit').remove()
vorpal
  .command('exit', 'stops borker and connectivity service')
  .action(function (args, callback) {
    bambooBroker.stop()
    process.exit(0)
  })

vorpal
  .command('fork', 'forks new broker process')
  .action(function (args, callback) {
    bambooBroker.fork()
    callback()
  })

vorpal
  .command('components', 'lists avaiable components')
  .action(function (args, callback) {
    this.log(bambooBroker.components.channels)
    callback()
  })

vorpal.log(' * 18.20 at Sep 07 2016 7:20 IR721')
vorpal.delimiter(`${chalk.green('Bamboo')} - ${chalk.rgb(255, 177, 79)('Connectivity')} > `).show()

/* Broker Cluster */
const BambooBroker = require('./src/cbroker')

const bambooBroker = new BambooBroker(
  config.broker.port,
  config.broker.processes
)
bambooBroker.on('ready', (worker) => {
  vorpal.log(` * MQTT at 0.0.0.0:${config.broker.port} on ${worker.id}`)
}).run()
