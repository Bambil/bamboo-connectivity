# Connectivity
[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](http://standardjs.com)

## Introduction
Docker based Distributed I1820 (d2I1820) is a new version of our platform that targets distributed environments.
d2I1820 uses microservice architecture and written in Node.js.

## Installation
```sh
# Mosca node.js based mqtt broker
npm install mosca --save --no-optional
```
## Docker
### Configuration

| Name              | Description           |
|:-----------------:|:--------------------- |
| I1820_MONGO_URL   | MonogDB access url    |
| I1820_BROKER_PORT | Broker listening port |
