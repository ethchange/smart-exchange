# smart-exchange
This script should be used to deploy and manage [ICAP](https://github.com/ethereum/wiki/wiki/ICAP:-Inter-exchange-Client-Address-Protocol) compatible ethereum exchange.

### Requirements

- node
- npm
- [solc](https://github.com/ethereum/cpp-ethereum) *0.9.19, available as a part of cpp-ethereum*
- [go-etheruem](https://github.com/ethereum/go-ethereum) *0.9.23* (or cpp-ethereum)

### Test environment

To setup test environment please go to [eth-deploy](https://github.com/debris/eth-deploy) repository and follow the steps there.

### Installation

```bash
gt clone https://github.com/debris/smart-exchange
cd smart-exchange
npm install
```

### Configuration

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

### Run

```bash
node app.js
```

### JSONRPC methods

#### exchange_create

Should be called to deploy new 'smart exchange' contract to ethereum network and to register it with given identifier.

params:

- identifier: 4 uppercase alphanumeric characters that are an exchange identifier
- overwrite: boolean that indicates, if we should create new exchange with given identifier if one already exists. True is unsafe.

curl example:

```bash
curl -X POST --data '{"id":8,"jsonrpc":"2.0","method":"exchange_create","params":["XROF", false]}' -H "Content-Type: application/json" http://localhost:8080
```

#### exchange_transfer

#### exchange_transactions

#### exchange_balance





