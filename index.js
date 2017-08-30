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

vorpal
  .command('fork', 'forks new broker process')
  .action(function (args, callback) {
    bambooMaster.fork()
    callback()
  })

vorpal
  .command('workers', 'list running workers')
  .action(function (args, callback) {
    this.log(` * Master - ${process.pid}`)
    this.log(` # CPU Usage: ${process.cpuUsage().user} millionth of a second`)
    this.log(` # Memory Usage: ${process.memoryUsage().heapUsed} bytes`)
    for (let worker of bambooMaster.workers) {
      this.log(` * Worker ${worker.id} - ${worker.process.pid}`)
    }
    callback()
  })

vorpal
  .command('components', 'lists avaiable components')
  .action(function (args, callback) {
    for (let channel in bambooMaster.components.channels) {
      this.log(`${chalk.rgb(255, 255, 186)(channel)}:`)
      for (let name in bambooMaster.components.channels[channel]) {
        this.log(`    ${chalk.rgb(186, 225, 255)(name)}:`)
        for (let id of bambooMaster.components.channels[channel][name]) {
          this.log(`        * component ${chalk.rgb(186, 255, 201)(id)}`)
        }
      }
    }
    callback()
  })

vorpal.log(' * 18.20 at Sep 07 2016 7:20 IR721')
vorpal.delimiter(`${chalk.green('Bamboo')} - ${chalk.rgb(255, 177, 79)('Connectivity')} > `).show()

/* Broker Cluster */
const BambooMaster = require('./src/master')

const bambooMaster = new BambooMaster(
  config.broker.port,
  config.broker.processes
)
bambooMaster.on('ready', (worker) => {
  vorpal.log(` * MQTT at 0.0.0.0:${config.broker.port} on ${worker.id}`)
}).run()
