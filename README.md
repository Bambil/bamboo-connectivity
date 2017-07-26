# Bamboo Connectivity
[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](http://standardjs.com)

## Introduction
Bamboo is an IoT platfrom that is product of three teams:

* Nahal Corporation
* Bambil Corporation
* I1820 Platfrom Developers

## Connectivity

## Installation
```sh
# Mosca node.js based mqtt broker
npm install mosca --save --no-optional
# MongoDB
sudo docker run --rm --name mongo -ti -p 27017:27017 mongo
```
## Docker
### Configuration

| Name              | Description           |
|:-----------------:|:--------------------- |
| I1820_MONGO_URL   | MonogDB access url    |
| I1820_BROKER_PORT | Broker listening port |
