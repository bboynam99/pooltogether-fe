import { abiEncodeSecret, asciiToHex, getContract, soliditySha3 } from '../web3'
import { pick} from 'lodash'
import PoolContractJSON from '../contracts/Pool.json'

enum PoolState {
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
  buyTickets: (numTix: number, account: string, callback: () => void) => void
  complete: (account: string, secret: string, callback: () => void) => any
  poolInfo: PoolInfo
  isOwner: (address: string) => any
  lock: (callback: () => void) => any
  unlock: (callback: () => void) => any
  withdraw: (account: string, callback: () => void) => any
  methodDocs: {[key: string]: {notice: string} | string}
}

const pAbi: any = PoolContractJSON.abi
let instanceOfContract: PoolInstance

export default async (owner: string, _secret: string): Promise<PoolInstance> => {
  if (instanceOfContract) return instanceOfContract

  const poolContract = getContract(pAbi, owner)
  const { buyTickets, complete, getInfo, isOwner, lock, unlock, withdraw } = poolContract.methods
  const secret: any = asciiToHex(_secret)
  const secretHash: string = soliditySha3(abiEncodeSecret(secret))
  const _methodDocs = PoolContractJSON.userdoc.methods

  const _buyTickets = (numTix: number, account: string, callback: () => void) => buyTickets(numTix).send({
    from: account,
  }).on('confirmation', callback)

  const _complete = (account: string, secret: string, callback: () => void) => complete(secret).send({
    from: account
  }).on('confirmation', callback)

  const _isOwner = (address: string): boolean => isOwner().call({from: address})

  const _lock = (callback: () => void) => lock(secretHash).send({
    from: owner
  }).on('confirmation', callback)

  const _poolInfo = pick(await getInfo().call(), [
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
  ])

  const _unlock = (callback: () => void) => unlock().send({
    from: owner
  }).on('confirmation', callback)

  const _withdraw = (account: string, callback: () => void) => withdraw().send({
    from: account,
    value: 0
  }).on('confirmation', callback)
  
  instanceOfContract = {
    buyTickets: _buyTickets,
    complete: _complete,
    isOwner: _isOwner,
    lock: _lock,
    methodDocs: _methodDocs,
    poolInfo: _poolInfo,
    unlock: _unlock,
    withdraw: _withdraw,
  }

  return instanceOfContract
}
