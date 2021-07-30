#!/usr/bin/env sh

docker run --name bulldog -p 8545:8545 -p 8546:8546 -v $(pwd):/bordata dojimachain/bulldog:latest /bin/sh -c "cd /bordata; sh start.sh"
