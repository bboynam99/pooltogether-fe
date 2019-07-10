import Web3 from 'web3'
import { Contract } from 'web3-eth-contract'
import { AbiItem } from 'web3-utils'
import { AbiCoder } from 'web3-eth-abi'

interface Window {
  ethereum?: any
  web3?: any
}

type CallbackWithAccounts = (accounts: string[]) => Promise<void>

declare var window: Window

const abiCoder = new AbiCoder()

// use the given Provider, e.g in the browser with Metamask, or instantiate a new websocket provider
let provider = 'ws://localhost:8545'
if (typeof window.ethereum !== 'undefined'
  || (typeof window.web3 !== 'undefined')) {

  // Web3 browser user detected. You can now use the provider.
  provider = window['ethereum'] || window.web3.currentProvider
}

export const web3 = new Web3(provider, undefined, {})

export const enable = (): Promise<string[]> => window.ethereum.enable()
export const onAccountsChanged = (callback: CallbackWithAccounts) => window.ethereum.on('accountsChanged', callback)
export const removeAccountsChanged = (callback: CallbackWithAccounts) => window.ethereum.off('accountsChanged', callback)
export const getContract = (abi: AbiItem | AbiItem[], tokenAddress: string): Contract => new web3.eth.Contract(abi, tokenAddress)
export const asciiToHex = (value: string): string => web3.utils.asciiToHex(value)
export const abiEncodeSecret = (secret: string): string => abiCoder.encodeParameters(['bytes'], [secret])
export const soliditySha3 = (value: string): string => web3.utils.soliditySha3(value)
export const fromWei = (value: string): string => web3.utils.fromWei(value)
export const toWei = (value: string): string => web3.utils.toWei(value)