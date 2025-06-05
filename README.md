[![npm (tag)](https://img.shields.io/npm/v/ethers-wallet-connector)](https://www.npmjs.com/package/ethers-wallet-connector)
![npm bundle size (version)](https://img.shields.io/bundlephobia/minzip/ethers-wallet-connector)
![npm (downloads)](https://img.shields.io/npm/dm/ethers-wallet-connector)

# Ethers Wallet Connector

A powerful and flexible wallet connection library for Ethereum-based applications, built on top of ethers.js. This library provides an easy way to connect to various Ethereum wallets (like MetaMask) and handle wallet-related events.

## Features

- 🔌 Easy wallet connection setup
- 🔄 Automatic network switching
- 🎯 Wallet address validation
- 🔔 Event-based architecture
- 📝 Contract interactions (call/send contract functions)

## Try it Out

Check out [our interactive playground](https://info.souldoit.com/testing/ethers-wallet-connector) where you can:
- Test wallet connections
- Try out different configurations
- See live examples of the library in action
- Experiment with contract interactions

## Documentation

* [Installation](#installation)
* [Quick Start](#quick-start)
* [Configuration](#configuration)
  * [Network Configuration](#network-configuration)
  * [Wallet Address Validation](#wallet-address-validation)
  * [Reconnect Callback](#reconnection-confirmation-callback)
  * [Auto Connect](#automatic-connection-on-initialization)
  * [Manual Connect](#manual-wallet-connection)
* [Events](#events)
* [Contract Interactions](#contract-interactions)
  * [Call (Read)](#reading-contract-data-call)
  * [Send (Write)](#send-transaction-send)
* [Supported Wallet Providers](#supported-wallet-providers)
* [Contributions](#support-me)

&nbsp;
&nbsp;

## Installation

```bash
npm install ethers-wallet-connector
```

## Quick Start

```typescript
import EthersWalletConnector from 'ethers-wallet-connector'

// Configure your network
const network = {
  chain_id: 97,
  chain_name: 'BNB Smart Chain Testnet',
  currency_name: 'BNB',
  currency_symbol: 'tBNB',
  rpc_url: 'https://data-seed-prebsc-1-s3.bnbchain.org:8545',
  block_explorer_url: 'https://testnet.bscscan.com',
};

// Optional: Set specific wallet address to allow
const walletAddress = null; // Allow any wallet address
// const walletAddress = '0x7Dfcf0490F44741eF65A1B1596141aC95f8B117A'; // Allow only specific address

const beforeReconnectCallback = async () => {
  return confirm('Try re-connect again?');
  // return true; // will proceed reconnect
  // return false; // will not proceed reconnect
};

const autoConnectAfterInit = false; // Will NOT automatically connect after initialize
// const autoConnectAfterInit = true; // Automatically connect after initialize

// Setup a connector
let walletConnector = EthersWalletConnector.setup(network, walletAddress, beforeReconnectCallback);

// Initialize the connector
walletConnector.init(autoConnectAfterInit);
```

## Configuration

### Network Configuration

The network configuration object should include:

```typescript
{
  chain_id: number;      // Chain ID of the network
  chain_name: string;    // Name of the network
  currency_name: string; // Name of the native currency
  currency_symbol: string; // Symbol of the native currency
  rpc_url: string;       // RPC URL for the network
  block_explorer_url: string; // Block explorer URL
}
```

### Wallet Address Validation

You can either:
- Set `walletAddress` to `null` to allow any wallet address
- Set `walletAddress` to a specific address to restrict connections to that address only

### Reconnection Confirmation Callback

The `beforeReconnectCallback` is a function that gets called when the library attempts to reconnect to a previously connected wallet. This callback allows you to:

- Control whether the reconnection should proceed
- Show custom UI/confirmation dialogs
- Perform any necessary checks before reconnecting

The callback should return:
- `true` to proceed with reconnection
- `false` to cancel reconnection
- A Promise that resolves to `true` or `false`

### Automatic Connection on Initialization

The `autoConnectAfterInit` parameter controls whether the library should automatically attempt to connect to a wallet after initialization.

- When set to `true`: The library will automatically try to connect to the wallet
- When set to `false`: The library will initialize but wait for manual connection

This is useful for:
- Providing a seamless experience for returning users
- Controlling the initial connection behavior
- Implementing custom connection flows

### Manual Wallet Connection

When `autoConnectAfterInit` is set to `false`, you'll need to manually connect and disconnect the wallet using the following methods:

```typescript
// Connect to wallet
await EthersWalletConnector.connectWallet();

// Disconnect from wallet
await EthersWalletConnector.disconnectWallet();
```

## Events

The library provides several events that you can listen to:

- `walletConnectorInitialized`: Triggered when the wallet connector is initialized
- `walletProviderNotFound`: Triggered when MetaMask or other wallet provider is not found
- `walletConnected`: Triggered when a wallet is successfully connected
- `walletDisconnected`: Triggered when the wallet is disconnected
- `failedToConnectWallet`: Triggered when wallet connection fails
- `failedToAddNetwork`: Triggered when adding a new network fails
- `failedToSwitchNetwork`: Triggered when switching networks fails
- `invalidWallet`: Triggered when an invalid wallet address is used
- `networkSwitched`: Triggered when the network is switched

### Example

```typescript
let walletConnector = EthersWalletConnector.setup(network, walletAddress, beforeReconnectCallback);

walletConnector.on('walletConnectorInitialized', async () => {
  alert('wallet connector initialized');
});

walletConnector.on('walletProviderNotFound', () => {
  alert('metamask not found');
});

walletConnector.on('walletConnected', (account) => {
  alert(`your wallet ${account} are now connected`);
});

walletConnector.on('walletDisconnected', () => {
  alert('wallet disconnected');
});

walletConnector.on('failedToConnectWallet', () => {
  alert('failed to connect to a wallet');
});

walletConnector.on('failedToAddNetwork', () => {
  alert(`failed to add network`);
});

walletConnector.on('failedToSwitchNetwork', () => {
  alert(`failed to switch network`);
});

walletConnector.on('invalidWallet', (validAccount) => {
  alert(`invalid wallet, you should connect to ${validAccount}`);
});

walletConnector.on('networkSwitched', (isCorrectNetwork, validNetworkName) => {
  if (!isCorrectNetwork) {
    alert(`your metamask should switched to correct network which is ${validNetworkName}`);
  }
});

walletConnector.init(autoConnectAfterInit);
```

or you can initialize through method chaining

```typescript
EthersWalletConnector.setup(network, walletAddress, beforeReconnectCallback)
.on('walletConnectorInitialized', async () => {
  alert('wallet connector initialized');
})
.on('walletProviderNotFound', () => {
  alert('metamask not found');
})
.on('walletConnected', (account) => {
  alert(`your wallet ${account} are now connected`);
})
.on('walletDisconnected', () => {
  alert('wallet disconnected');
})
.on('failedToConnectWallet', () => {
  alert('failed to connect to a wallet');
})
.on('invalidWallet', (validAccount) => {
  alert(`invalid wallet, you should connect to ${validAccount}`);
})
.on('networkSwitched', (isCorrectNetwork, validNetworkName) => {
  if (!isCorrectNetwork) {
    alert(`your metamask should switched to correct network which is ${validNetworkName}`);
  }
})
.init(autoConnectAfterInit);
```

## Contract Interactions

The library provides a simple way to interact with smart contracts. You can easily read contract data (call) and send transactions (send) to the blockchain.

### Reading Contract Data (Call)

To read data from a contract, use the `call` method. This is a read-only operation that doesn't require gas fees.

```typescript
import UsdtContractAbi from './contract-abi/usdt.json';
import { formatEther } from "ethers";

// Contract address on BSC Mainnet
const usdtContractAddress = '0x55d398326f99059ff775485246999027b3197955';

// Initialize contract instance
const usdtContract = await EthersWalletConnector.contract(usdtContractAddress, UsdtContractAbi);

// Read USDT balance
const balance = await usdtContract.call('balanceOf', [
    EthersWalletConnector.account()
]);
console.log('USDT Balance:', formatEther(balance));
```

Or for some Call Functions that need signed transaction, you can use `signedCall`.

Example:

```typescript
const myClaimableToken = await usdtContract.signedCall('myClaimableView');
console.log('You can claim:', formatEther(myClaimableToken));
```

### Send Transaction (Send)

To send a transaction to the blockchain, use the `send` method. This will prompt the user to approve the transaction in their wallet.

```typescript
import UsdtContractAbi from './contract-abi/usdt.json';
import { parseEther } from "ethers";

// Contract address on BSC Mainnet
const usdtContractAddress = '0x55d398326f99059ff775485246999027b3197955';
    
// Initialize contract instance
const usdtContract = await EthersWalletConnector.contract(usdtContractAddress, UsdtContractAbi);

const receiverAddress = '0x364d8eA5E7a4ce97e89f7b2cb7198d6d5DFe0aCe';
const amount = 125;

// Send 125 USDT to the receiver address
const txn = await usdtContract.send('transfer', [
    receiverAddress,
    parseEther(amount.toString()),
]);

if (! txn.success) {
    console.log('Transaction failed (1):', txn.error.message);
} else {
  // Just start processing
  console.log('Processing transaction:', txn.data.hash);

  // Wait until the transaction finish
  const result = await txn.waitForFinish();

  // Check transaction status
  if (! result.success) {
      console.log('Transaction failed (2):', result.error.message);
  } else {
      console.log('Transaction successful:', result.data.hash);
  }

  // Log full transaction result
  console.log(result);
}
```

The `send` method returns a transaction object that includes:
- `hash`: The transaction hash (if successful)
- Other transaction details like gas used, block number, etc.

## Supported Wallet Providers

Currently, this library supports MetaMask as the primary wallet provider. Maybe in future we will expanding support to include other popular wallet providers such as Coinbase Wallet and more in future releases.

- MetaMask

## Support me

If you find this package helps you, kindly support me by donating some BNB (BSC) to the address below.

```
0x364d8eA5E7a4ce97e89f7b2cb7198d6d5DFe0aCe
```

<img src="https://info.souldoit.com/img/wallet-address-bnb-bsc.png" width="150">

&nbsp;
&nbsp;
## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
