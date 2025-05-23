import { 
  BrowserProvider, 
  Contract,
  toNumber,
  toBeHex
} from "ethers";
import { EventEmitter } from 'events';
import detectEthereumProvider from '@metamask/detect-provider';

class EthersWalletConnector extends EventEmitter
{
  #shouldNetworkData;
  #shouldWalletAddress;
  #isInitalized = false;
  #provider;
  #browserProvider;
  #signer;
  #account;
  #currentChainId;
  #execBeforeReconnect;
  #signerContract = {};
  #providerContract = {};

  provider = () => this.#provider;
  signer = () => this.#signer;
  account = () => this.#account ?? undefined;
  currentChainId = () => this.#currentChainId;
  isCorrectNetwork = () => this.#currentChainId === (this.#shouldNetworkData?.chain_id ?? 0);
  isWalletConnected = () => !(this.#account === null || this.#account === undefined);

  async init(shouldNetworkData, shouldWalletAddress = null, execBeforeReconnect = null, autoConnect = true)
  {
    if (this.#isInitalized) {
      this.#error("EthersWalletConnector is already initialized.");
    }

    this.#shouldNetworkData = shouldNetworkData;
    this.#shouldWalletAddress = shouldWalletAddress;
    this.#execBeforeReconnect = execBeforeReconnect;
    if (typeof autoConnect === 'function') {
      autoConnect = autoConnect();
    }

    this.#checkShouldNetworkDataIsCorrect();

    this.#browserProvider = window.ethereum ?? await detectEthereumProvider();

    if (this.#browserProvider) {
      this.#provider = new BrowserProvider(this.#browserProvider);

      if (autoConnect) await this.connectWallet();
      else await this.#detectNetwork(true);

      this.#browserProvider.on('chainChanged', async () => {
        const isCorrectNetwork = await this.#detectNetwork();
        this.emit('networkSwitched', isCorrectNetwork);
      });

      this.#isInitalized = true;
      this.emit('walletConnectorInitialized');
    } else {
      this.emit('browserProviderNotFound');
      this.#error("You should install MetaMask.");
    }
  }

  destroy()
  {
    this.#shouldNetworkData = undefined;
    this.#shouldWalletAddress = undefined;
    this.#isInitalized = false;
    this.#provider = undefined;
    this.#browserProvider = undefined;
    this.#signer = undefined;
    this.#account = undefined;
    this.#currentChainId = undefined;
    this.#execBeforeReconnect = undefined;
    this.#signerContract = {};
    this.#providerContract = {};
  }

  async connectWallet(forceNewConnect = false)
  {
    const isCorrectNetwork = await this.#detectNetwork(true);
    if (!isCorrectNetwork) {
      return undefined;
    }

    if (typeof forceNewConnect === 'function') {
      forceNewConnect = forceNewConnect();
    }

    if (forceNewConnect) {
      const connected = await this.#requestConnect();

      if (!connected) {
        this.emit('failedToConnectWallet');
        return undefined;
      }
    }

    let accounts = await this.#getCurrentAccounts();
    if (! Array.isArray(accounts)) accounts = [];

    let tryConnectCount = 0;
    const reconnect = async (failEventName = 'failedToConnectWallet') => {
      if (tryConnectCount > 0) {
        let shouldRetry = true;

        if (tryConnectCount > 3) shouldRetry = false;

        if (shouldRetry) {
          if (typeof this.#execBeforeReconnect === 'function') {
            let newShouldRetry = await this.#execBeforeReconnect();
            if (typeof newShouldRetry !== 'boolean') shouldRetry = true;
            else shouldRetry = newShouldRetry;
          }
        }

        if (! shouldRetry) {
          this.emit(failEventName);
          accounts = null;
          return false;
        }
      }

      if (! await this.#requestConnect()) {
        this.emit('failedToConnectWallet');
        accounts = null;
        return false;
      }

      accounts = await this.#getCurrentAccounts();
      tryConnectCount++;

      return true;
    }

    if (isCorrectNetwork) {
      if (this.#shouldWalletAddress !== null) {
        while (! accounts.map((account) => account.toUpperCase()).includes(this.#shouldWalletAddress.toUpperCase())) {
          if (! await reconnect('invalidWallet')) break;
        }
      } else {
        while (accounts.length <= 0) {
          if (! await reconnect()) break;
        }
      }

      if (accounts !== null) {
        const account_index = this.#shouldWalletAddress !== null ? accounts.map((account) => account.toUpperCase()).indexOf(this.#shouldWalletAddress.toUpperCase()) : 0;
        this.#account = accounts[account_index];
        this.#signer = await this.#provider.getSigner(this.#account);
        this.emit('walletConnected', this.#account);
      }
    }

    return this.#account;
  }

  async disconnectWallet()
  {
    if (this.isWalletConnected()) {
      this.#account = undefined;
      this.emit('walletDisconnected');
    }
  }

  async #getCurrentAccounts()
  {
    return await this.#browserProvider.request({
      method: 'eth_accounts',
      params: []
    });
  }

  async #requestConnect()
  {
    try {
      await this.#browserProvider.request({
        method: 'wallet_requestPermissions',
        params: [
          {
            "eth_accounts": {}
          }
        ]
      });

      return true;
    } catch (e) {
      return false;
    }
  }

  async #detectNetwork(askUserToSwitch = false)
  {
    this.#currentChainId = toNumber(await this.#browserProvider.request({ method: 'eth_chainId' }));

    if (! this.isCorrectNetwork()) {
      if (askUserToSwitch) {
        let isSwitched = await this.#addOrSwitchNetwork();
        return isSwitched;
      } else {
        this.disconnectWallet();
        return false;
      }
    }

    return true;
  }

  async #addOrSwitchNetwork()
  {
    const params = [
      {
        "chainId": toBeHex(this.#shouldNetworkData.chain_id),
        "chainName": this.#shouldNetworkData.chain_name,
        "rpcUrls": [
          this.#shouldNetworkData.rpc_url,
        ],
        "nativeCurrency": {
          "name": this.#shouldNetworkData.currency_name,
          "symbol": this.#shouldNetworkData.currency_symbol,
          "decimals": this.#shouldNetworkData.currency_decimals ?? 18,
        }
      }
    ];

    if ((this.#shouldNetworkData.block_explorer_url ?? '') !== '') params[0].blockExplorerUrls = [this.#shouldNetworkData.block_explorer_url];

    try {
      await this.#browserProvider.request({
        method: "wallet_addEthereumChain",
        params, 
      })
    } catch (e) {
      this.emit('failedToAddnetwork');
      return false;
    }

    this.#currentChainId = toNumber(await this.#browserProvider.request({ method: 'eth_chainId' }));

    return this.isCorrectNetwork();
  }

  async contract(contractAddress, ABI, isSigner = false)
  {
    if (! this.isWalletConnected()) {
      await this.connectWallet();
    }

    let contract;

    if (isSigner) contract = (this.#signerContract[contractAddress] ??= new Contract(contractAddress, ABI, this.#signer));
    else contract = (this.#providerContract[contractAddress] ??= new Contract(contractAddress, ABI, this.#provider));

    return new (function () {

      this.call = async function (methodName, methodParams = [], callParams = {}, onError = null) { 
        try {
          return await contract[methodName](...methodParams, callParams);
        } catch (e) {
          if (typeof onError === 'function') return (onError(e) ?? null);
          else console.log(e); //TODO: should erase this on production
        }

        return null;
      };

      this.send = async function (methodName, methodParams = [], sendParams = {}) {
        try {
          const txn = await contract[methodName](...methodParams, sendParams);

          const receipt = await txn.wait();

          return receipt;
        } catch (e) {
          console.log(e); //TODO: should erase this on production
          return e?.info?.error ?? (e?.innerError ?? e);
        }
      };

    })();
  }

  #checkShouldNetworkDataIsCorrect()
  {
    if (this.#shouldNetworkData === undefined || this.#shouldNetworkData === null) {
      this.#error("You should initialize EthersWalletConnector with chainData in first parameter.");
    }

    const requiredOptions = ['chain_id', 'chain_name', 'currency_name', 'currency_symbol', 'rpc_url'];
    
    requiredOptions.forEach((option) => {
      if (this.#shouldNetworkData[option] === undefined) this.#error(`'${option}' option is required in 'shouldNetworkData'.`);
    });
  }

  #error(message)
  {
    throw `ERROR - EthersWalletConnector: ${message}`;
  }
}

export default new EthersWalletConnector;