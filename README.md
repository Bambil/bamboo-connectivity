# Bamboo Connectivity
[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](http://standardjs.com)

![bamboo](https://img.shields.io/badge/bambil-bamboo-orange.svg?style=flat-square)
[![Travis](https://img.shields.io/travis/bambil/bamboo-connectivity.svg?style=flat-square)](https://travis-ci.org/bambil/bamboo-connectivity)
![Docker Automated build](https://img.shields.io/docker/automated/ibamboo/connectivity.svg?style=flat-square)
[![](https://images.microbadger.com/badges/image/ibamboo/connectivity.svg)](https://microbadger.com/images/ibamboo/connectivity "Get your own image badge on microbadger.com")

## Introduction
Bamboo is an IoT platfrom that is the product of three teams:

* Nahal Corporation
* Bambil Corporation
* I1820 Platfrom Developers

## Connectivity
[MQTT](http://mqtt.org/) broker based on [aedes](https://github.com/mcollina/aedes)
which is customized for Bamboo needs. Bamboo uses this broker for
communicate with things and components.

## Up and Running
```sh
sudo docker run -p 1883:1883 ibamboo/connectivity
```

## Configuration

| Name                    | Description           |
|:-----------------------:|:--------------------- |
| BAMBOO_PROCESSES | Bamboo connectivity concurrent processes |
| BAMBOO_BROKER_PORT | Broker listening port |
| BAMBOO_COAP_PORT | CoAP listening port |
