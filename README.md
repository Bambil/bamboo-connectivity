# Bambo Connectivity
[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](http://standardjs.com)

## Introduction
Bambo is IoT platfrom that is come from join of three team:
1. Nahal Corporation
2. Bambil Corporation
3. I1820 Platfrom Developrs

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
