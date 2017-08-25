/*
 * +===============================================
 * | Author:        Parham Alvani <parham.alvani@gmail.com>
 * |
 * | Creation Date: 24-08-2017
 * |
 * | File Name:     src/logger.js
 * +===============================================
 */
const winston = require('winston')
const config = require('config')

const logger = new winston.Logger({
  rewriters: [function (level, msg, meta) {
    if (meta) {
      meta.component = 'bamboo-log'
    } else {
      meta = {
        component: 'bamboo-log'
      }
    }
    return meta
  }],

  transports: [
    new winston.transports.File({
      filename: 'bamboo-log.log',
      colorize: true,
      timestamp: true,
      prettyPrint: true,
      json: false,
      tailable: true,
      maxFiles: 1
    }), new winston.transports.Http({
      host: config.winstond.host,
      port: config.winstond.port
    })
  ]
})

module.exports = logger
