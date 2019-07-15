import Web3 from 'web3'
import { Contract } from 'web3-eth-contract'
import { AbiItem } from 'web3-utils'
import BN from 'bn.js'

interface Window {
  ethereum?: any
  web3?: any
}

type CallbackWithAccounts = (accounts: string[]) => void

declare var window: Window

// use the given Provider, e.g in the browser with Metamask, or instantiate a new websocket provider
let provider = 'ws://localhost:8545'
if (typeof window.ethereum !== 'undefined' || typeof window.web3 !== 'undefined') {
  // Web3 browser user detected. You can now use the provider.
  provider = window['ethereum'] || window.web3.currentProvider
}

export const web3 = new Web3(provider, undefined, {})

export const enable = (): Promise<string[]> => window.ethereum.enable()
export const onAccountsChanged = (callback: CallbackWithAccounts) =>
  window.ethereum.on('accountsChanged', callback)
export const removeAccountsChanged = (callback: CallbackWithAccounts) =>
  window.ethereum.off('accountsChanged', callback)
export const getContract = (abi: AbiItem | AbiItem[], contractAddress: string): Contract =>
  new web3.eth.Contract(abi, contractAddress)
export const asciiToHex = (value: string): string => web3.utils.asciiToHex(value)
export const abiEncodeSecret = (secret: string): string =>
  web3.eth.abi.encodeParameter('bytes32', secret)
export const soliditySha3 = (value: string): string => web3.utils.soliditySha3(value)
export const fromWei = (value: string | BN): string => web3.utils.fromWei(value)
export const toWei = (value: string): string => web3.utils.toWei(value)
export const toBn = (value: number): BN => web3.utils.toBN(value)
