# Ethers Wallet Connector

A powerful and flexible wallet connection library for Ethereum-based applications, built on top of ethers.js. This library provides an easy way to connect to various Ethereum wallets (like MetaMask) and handle wallet-related events.

## Features

- 🔌 Easy wallet connection setup
- 🔄 Automatic network switching
- 🎯 Wallet address validation
- 🔔 Event-based architecture
- 🛡️ Type-safe implementation
- 🌐 Method-chaining support

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

## Events

The library provides several events that you can listen to:

- `walletConnectorInitialized`: Triggered when the wallet connector is initialized
- `walletProviderNotFound`: Triggered when MetaMask or other wallet provider is not found
- `walletConnected`: Triggered when a wallet is successfully connected
- `walletDisconnected`: Triggered when the wallet is disconnected
- `failedToConnectWallet`: Triggered when wallet connection fails
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

## Method-chaining support

The library provides a fluent interface through method chaining, allowing you to configure and initialize the wallet connector in a clean, readable way. This approach enables you to chain multiple event listeners and configuration methods in a single statement, making your code more concise and maintainable.

### Example

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

## Supported Wallet Providers

Currently, this library supports MetaMask as the primary wallet provider. Maybe in future we will expanding support to include other popular wallet providers such as Coinbase Wallet, and more in future releases.

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
