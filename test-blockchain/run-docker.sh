#!/usr/bin/env sh

docker run --name dojimachain -p 8545:8545 -p 8546:8546 -v $(pwd):/bordata dojimachain/dojimachain:latest /bin/sh -c "cd /bordata; sh start.sh"
