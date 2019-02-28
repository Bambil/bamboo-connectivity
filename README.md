# Bamboo Connectivity

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](http://standardjs.com)

![bamboo](https://img.shields.io/badge/bambil-bamboo-orange.svg?style=flat-square)

## Introduction

Bamboo is an IoT platfrom that is the product of three teams:

* Nahal Corporation
* Bambil Corporation
* I1820 Platfrom Developers

## Connectivity

[MQTT](http://mqtt.org/) broker based on [aedes](https://github.com/moscajs/aedes)
which is customized for Bamboo needs. Bamboo uses this broker for
communicate with things and components.

## Up and Running

```bash
sudo docker run -p 1883:1883 ibamboo/connectivity
```

## Configuration

| Name                    | Description           |
|:-----------------------:|:--------------------- |
| BAMBOO_PROCESSES | Bamboo connectivity concurrent processes |
| BAMBOO_BROKER_PORT | Broker listening port |
| BAMBOO_COAP_PORT | CoAP listening port |
