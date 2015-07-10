# smart-exchange
This script should be used to deploy and manage [ICAP](https://github.com/ethereum/wiki/wiki/ICAP:-Inter-exchange-Client-Address-Protocol) compatible ethereum exchange.

## Requirements

Before using `smart-exchange` you need to install the following tools and you need to make sure that **ALL** of them are available in your PATH

- [node](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [solc](https://github.com/ethereum/cpp-ethereum) *0.1.0, available as a part of cpp-ethereum --devel*
- [go-etheruem](https://github.com/ethereum/go-ethereum) *0.9.38*
- [embark](https://github.com/iurimatias/embark-framework)

## Environment

This script requires `geth` running in the background, with jsonrpc server on.

## Test environment requirements

To setup test environment please go to [eth-deploy](https://github.com/debris/eth-deploy) repository and follow the steps there. `embark-blockchain` command will run `geth` client with proper configuration in the background.

## Installation

```bash
gt clone https://github.com/debris/smart-exchange
cd smart-exchange
npm install
```

## Usage

Before you start using `smart-exchange` you need to setup 2 options - `namereg` and `owner`. Look at configuration section for more details.

```bash
node app.js
```

## Configuration

- **contract** - path to the contract which should be used on exchange creation.
- **contract_name** - name of exchange contract which should be used.
- **jsonrpc_host** - native client jsonrpc host, eg. `localhost`
- **jsonrpc_port** - native client jsonrpc port, eg. `8545`
- **exchange_interface** - smart-exchange jsonrpc interface. Available options `http` && `tcp`
- **exchange_port** - port for smart-exchange jsonrpc, eg. `8080`
- **owner** - address of unlocked account which from which exchange is being created, eg. `0xe30b49f729469c3b8ffef495b31e4d4e790a1a46`
- **namereg** - address of namereg which should be used to register identifiers, eg. `0xb6eab56fb20feba03bcdbd7789cc24740f6b90ee`. You can also use `default`.

example: 

```json
{
    "contract": "lib/contract/SmartExchange.sol",
    "contract_name": "SmartExchange",
    "jsonrpc_host": "localhost",
    "jsonrpc_port": "8545",
    "exchange_interface": "http",
    "exchange_port": 8080,
    "owner": "0xe30b49f729469c3b8ffef495b31e4d4e790a1a46",
    "namereg": "0xb6eab56fb20feba03bcdbd7789cc24740f6b90ee"
}
```

## JSONRPC methods

### exchange_create

Should be called to deploy new `smart exchange` contract to ethereum network and to register it with given identifier.

**request params:**

- **identifier**: unique 4 uppercase alphanumeric characters that are an exchange identifier
- **overwrite**: boolean that indicates, if we should create new exchange with given identifier if one already exists. True is unsafe.

**request example:**

```json
{
  "id": 8,
  "jsonrpc": "2.0",
  "method": "exchange_create",
  "params": [
    "XROF",
    false
  ]
}
```

**using curl:**

```bash
curl -X POST --data '{"id":8,"jsonrpc":"2.0","method":"exchange_create","params":["XROF", false]}' -H "Content-Type: application/json" http://localhost:8080
```

**response:**

- **result** - address of the created exchange

**response example:**

```json
{
  "jsonrpc": "2.0",
  "id": 8,
  "result": "0x209f728097e6ea54068c62b5b534c115b9c5d5b5"
}
```

### exchange_transfer

Should be called to transfer funds from exchange's client to other address / institution. Might be also used for internal transfers.

**request params:**

- **identifier**: unique 4 uppercase alphanumeric characters that are an exchange identifier
- **from**: unique user identifier, 9 alphanumeric characters.
- **to**, string which is one of:
    - **address**, ethereum address, 20 bytes in base 16 representation
    - **direct iban**, 34 alphanumeric characters, https://github.com/ethereum/wiki/wiki/ICAP:-Inter-exchange-Client-Address-Protocol#direct
    - **indirect iban**, 20 alphanumeric characters, https://github.com/ethereum/wiki/wiki/ICAP:-Inter-exchange-Client-Address-Protocol#indirect
    - **unique userid**, 9 alphanumeric characters
- **value**: value that should be sent

**request example:**

```json
{
  "id": 8,
  "jsonrpc": "2.0",
  "method": "exchange_transfer",
  "params": [
    "XROF",
    "GAVOFYORK",
    "0xdc167599eeef974dcbdc6c49da98c42ac9e1c64b",
    6
  ]
}
```

**using curl:**

```bash
curl -X POST --data '{"id":8,"jsonrpc":"2.0","method":"exchange_transfer","params":["XROF", "GAVOFYORK", "0xdc167599eeef974dcbdc6c49da98c42ac9e1c64b", 6]}' -H "Content-Type: application/json" http://localhost:8545
```

**response:**

- **result** - transaction hash

**response example:**

```json
{
  "jsonrpc": "2.0",
  "id": 8,
  "result": "0x462602d51f5c4db38bd419529fd7a206735cf497a433eb81134fcecc910757e2"
}
```

### exchange_transactions

Should be called to get list of exchange's transactions.

**request params:**

- **identifier**: unique 4 uppercase alphanumeric characters that are an exchange identifier
- **options**: may contain additional fields (fromBlock, toBlock), that should be used to filter exchange transactions

**request example:**

```json
{
  "id": 8,
  "jsonrpc": "2.0",
  "method": "exchange_transactions",
  "params": [
    "XROF",
    {
      "fromBlock": 100
    }
  ]
}
```

**using curl:**

```bash
curl -X POST --data '{"id":8,"jsonrpc":"2.0","method":"exchange_transactions","params":["XROF", {"fromBlock": 100}]}' -H "Content-Type: application/json" http://localhost:8080
```

**response:**

- **result** array of transaction logs

**response example:**

```json
{
  "jsonrpc": "2.0",
  "id": 8,
  "result": [
    {
      "address": "0x9b173b6fab888af1b5eff49bf34c7aaebf58673f",
      "blockNumber": 55,
      "logIndex": 0,
      "blockHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
      "transactionHash": "0x26cbc502a25df0a8c834b7eab0417df9c94e612ea02778a05020f219b3a5f0d3",
      "transactionIndex": 0,
      "event": "Deposit",
      "args": {
        "from": "0x275ac21e0b9383dcc0fa0fc4ecf7bf1ec7c4bba9",
        "to": "0x4d4152454b4f464b4b0000000000000000000000000000000000000000000000",
        "value": "15000"
      }
    }
  ]
}
```

### exchange_balance

Should be called to check the balance of `smart exchange` with given identifier.

**request params:**

- **identifier**: unique 4 uppercase alphanumeric characters that are an exchange identifier

**request example:**

```json
{
  "id": 8,
  "jsonrpc": "2.0",
  "method": "exchange_balance",
  "params": [
    "XROF"
  ]
}
```

**using curl:**

```bash
curl -X POST --data '{"id":8,"jsonrpc":"2.0","method":"exchange_balance","params":["XROF"]}' -H "Content-Type: application/json" http://localhost:8080
```

**response:**

- **result** exchange balance

**response example:**

```json
{
  "jsonrpc": "2.0",
  "id": 8,
  "result": "0"
}"
```

# TL;DR

- first install:
    - node
    - npm
    - geth (0.9.38)
    - solc (part of cpp-ethereum, 0.1.0 --devel)
    - [embark](https://github.com/iurimatias/embark-framework) (for setting up private chain)

- (for private chain) setup your test environment using [eth-deploy](https://github.com/debris/eth-deploy)

- clone this repository (smart-exchange) and setup config (address of namereg, and address of owner)
- run `node app.js`
- everyting is ready! you can use the API now!


# TODO

- `exchange_transaction(transactionHash)` method
- configurable gas limits. It's required to make withdraws safe. Otherwise withdraw might drain to much ether from owner address.
- consider requirement for user to `issue` ether. it's safer
