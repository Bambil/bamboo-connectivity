# Bamboo Connectivity
[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](http://standardjs.com)

![bamboo](https://img.shields.io/badge/bambil-bamboo-orange.svg?style=flat-square)

## Introduction
Bamboo is an IoT platfrom that is the product of three teams:

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
## Configuration

| Name               | Description           |
|:------------------:|:--------------------- |
| BAMBOO_MONGO_URL   | MonogDB access url    |
| BAMBOO_BROKER_PORT | Broker listening port |
