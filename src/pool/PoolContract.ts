import { abiEncodeSecret, asciiToHex, getContract, soliditySha3 } from '../web3'
import { pick} from 'lodash'
import PoolContractJSON from '../contracts/Pool.json'

export enum PoolState {
  OPEN,
  LOCKED,
  UNLOCKED,
  COMPLETE
}

export interface PoolInfo {
  entryTotal: number
  startBlock: number
  endBlock: number
  poolState: PoolState
  winner: string
  supplyBalanceTotal: number
  ticketCost: number
  participantCount: number
  maxPoolSize: number
  estimatedInterestFixedPoint18: number
  hashOfSecret: string
}

export interface PoolInstance {
  buyTickets: (numTix: number, account: string, callback: (confirmationNumber: number) => void) => Promise<void>
  complete: (address: string, secret: string, callback: () => void) => Promise<void>
  getEntry: (account: string) => Promise<any>
  getInfo: () => Promise<PoolInfo>
  isOwner: (address: string) => Promise<boolean>
  lock: (address: string, secretHash: string, callback: () => void) => Promise<void>
  unlock: (address: string, callback: () => void) => Promise<void>
  winnings: (account: string) => Promise<number>
  withdraw: (account: string, callback: () => void) => Promise<void>
  methodDocs: {[key: string]: {notice: string} | string}
}

const pAbi: any = PoolContractJSON.abi
let instanceOfContract: PoolInstance

export default (owner: string): PoolInstance => {
  if (instanceOfContract) return instanceOfContract

  const poolContract = getContract(pAbi, owner)
  const { buyTickets, complete, getEntry, getInfo, isOwner, lock, unlock, winnings, withdraw } = poolContract.methods

  const _methodDocs = PoolContractJSON.userdoc.methods

  const _buyTickets = (numTix: number, account: string, callback: (confirmationNumber: number) => void) => buyTickets(numTix).send({
    from: account,
  }).on('confirmation', callback)

  const _complete = (account: string, secret: string, callback: () => void) => complete(secret).send({
    from: account
  }).on('confirmation', callback)

  const _getEntry = (account: string) => getEntry(account).call()

  const _getInfo = getInfo().call().then((info: PoolInfo) => pick(info, [
    'entryTotal',
    'startBlock',
    'endBlock',
    'poolState',
    'winner',
    'supplyBalanceTotal',
    'ticketCost',
    'participantCount',
    'maxPoolSize',
    'estimatedInterestFixedPoint18',
    'hashOfSecret',
  ]))

  const _isOwner = (address: string) => isOwner().call({from: address})

  const _lock = (address: string, secretHash: string, callback: () => void) => lock(secretHash).send({
    from: address
  }).on('confirmation', callback)

  const _unlock = (address: string, callback: () => void) => unlock().send({
    from: address
  }).on('confirmation', callback)

  const _winnings = (address: string) => winnings(address).call()

  const _withdraw = (account: string, callback: () => void) => withdraw().send({
    from: account,
    value: 0
  }).on('confirmation', callback)
  
  instanceOfContract = {
    buyTickets: _buyTickets,
    complete: _complete,
    getEntry: _getEntry,
    getInfo: _getInfo,
    isOwner: _isOwner,
    lock: _lock,
    methodDocs: _methodDocs,
    unlock: _unlock,
    winnings: _winnings,
    withdraw: _withdraw,
  }

  return instanceOfContract
}
