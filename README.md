# dojima contracts

![Build Status](https://github.com/dojimanetwork/contracts/workflows/CI/badge.svg)

Ethereum smart contracts that power the [dojima Network](http://dojima.network).

### Install dependencies with

```
npm install
```

### Compile

bulldog-chain-id for Testnet = 1001

```
npm run template:process -- --bulldog-chain-id <bulldog-chain-id>
npm run truffle:compile
```

### Start main chain and side chain

- Start Main chain

```
npm run testrpc
```

- Start dojima side chain. Requires docker.

```
npm run bulldog:simulate
```

- If you ran a bulldog instance before, a dead docker container might still be lying around, clean it with

```
npm run bulldog:clean
```

- Run a bor (our dojima chain node) instance.

### Deploy Contracts

- For local development

```
npm run truffle:migrate
```

- For a properly initialized set of contracts, follow the instructions [here](./deploy-migrations/README.md).

### Run tests

```
npm test
```
