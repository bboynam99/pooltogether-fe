import { fromWei, getContract } from '../../web3'
import { groupBy, pick } from 'lodash'
import { allEventsOptions, OnConfirmationHandler, PoolEventReponse } from '../contract.model'
import PoolContractJSON from './Pool.json'

export enum PoolEvent {
  BOUGHT_TICKETS = 'BoughtTickets',
  WITHDRAWN = 'Withdrawn',
  POOL_LOCKED = 'PoolLocked',
  POOL_UNLOCKED = 'PoolUnlocked',
  POOL_COMPLETE = 'PoolComplete',
  ALL = 'allEvents'
}

export interface PoolStats {
  purchases: Purchase[]
  withdrawals: Withdrawal[]
}

export enum PoolState {
  OPEN,
  LOCKED,
  UNLOCKED,
  COMPLETE,
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

export interface Purchase {
  buyer: string
  tickets: number
  total: number
  transactionHash: string
}

export interface Withdrawal {
  destination: string
  amount: number
  transactionHash: string
}

export interface PoolInstance {
  buyTickets: (
    numTix: number,
    account: string,
    callback: OnConfirmationHandler,
  ) => Promise<void>
  complete: (address: string, secret: string, callback: OnConfirmationHandler) => Promise<void>
  getEntry: (account: string) => Promise<any>
  getInfo: () => Promise<PoolInfo>
  getPastEvents: (type: PoolEvent, options: any) => Promise<PoolEventReponse[]>
  getPurchases: () => Promise<Purchase[]>
  getWithdrawals: () => Promise<Withdrawal[]>
  isOwner: (address: string) => Promise<boolean>
  lock: (address: string, secretHash: string, callback: OnConfirmationHandler) => Promise<void>
  netWinnings: () => Promise<number>
  unlock: (address: string, callback: OnConfirmationHandler) => Promise<void>
  winnings: (account: string) => Promise<number>
  withdraw: (account: string, callback: OnConfirmationHandler) => Promise<void>
  methodDocs: { [key: string]: { notice: string } | string }
}

const pAbi: any = PoolContractJSON.abi

export default (poolAddress: string): PoolInstance => {
  const contract = getContract(pAbi, poolAddress)
  const {
    buyTickets,
    complete,
    getEntry,
    getInfo,
    isOwner,
    lock,
    netWinnings,
    unlock,
    winnings,
    withdraw,
  } = contract.methods
  const _methodDocs = PoolContractJSON.userdoc.methods

  const _buyTickets = (
    numTix: number,
    account: string,
    callback: (confirmationNumber: number) => void,
  ) =>
    buyTickets(numTix)
      .send({
        from: account,
      })
      .on('confirmation', callback)

  const _complete = (account: string, secret: string, callback: OnConfirmationHandler) =>
    complete(secret)
      .send({
        from: account,
      })
      .on('confirmation', callback)

  const _getEntry = (account: string) => getEntry(account).call()

  const _getInfo = () =>
    getInfo()
      .call()
      .then((info: PoolInfo) =>
        pick(info, [
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
        ]),
      )

  const _getPastEvents = (type: PoolEvent, options: any = allEventsOptions) => contract.getPastEvents(type, options)

  const _getStats = () => _getPastEvents(PoolEvent.ALL).then(evts => groupBy(evts, 'event'))

  const _getPurchases = async () => {
    const stuff = await _getStats()
    console.log(stuff)
    return []
  }

  const _getWithdrawals = async () => {
    const events = await _getPastEvents(PoolEvent.POOL_LOCKED)
    console.log(events)
    return events.map(evt => ({
      amount: Number(fromWei(evt.returnValues.amount.toString())),
      destination: evt.returnValues.sender,
      transactionHash: evt.transactionHash
    }))
  }

  const _isOwner = (address: string) => isOwner().call({ from: address })

  const _lock = (address: string, secretHash: string, callback: OnConfirmationHandler) =>
    lock(secretHash)
      .send({
        from: address,
      })
      .on('confirmation', callback)

  const _netWinnings = () => netWinnings().call()

  const _unlock = (address: string, callback: OnConfirmationHandler) =>
    unlock()
      .send({
        from: address,
      })
      .on('confirmation', callback)

  const _winnings = (address: string) => winnings(address).call()

  const _withdraw = (account: string, callback: OnConfirmationHandler) =>
    withdraw()
      .send({
        from: account,
        value: 0,
      })
      .on('confirmation', callback)

  return {
    buyTickets: _buyTickets,
    complete: _complete,
    getEntry: _getEntry,
    getInfo: _getInfo,
    getPastEvents: _getPastEvents,
    getPurchases: _getPurchases,
    getWithdrawals: _getWithdrawals,
    isOwner: _isOwner,
    lock: _lock,
    methodDocs: _methodDocs,
    netWinnings: _netWinnings,
    unlock: _unlock,
    winnings: _winnings,
    withdraw: _withdraw,
  }
}
