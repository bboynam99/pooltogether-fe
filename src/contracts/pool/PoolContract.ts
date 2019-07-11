import { fromWei, getContract } from '../../web3'
import { groupBy, pick } from 'lodash'
import { allEventsOptions, OnConfirmationHandler, PoolEventResponse } from '../contract.model'
import PoolContractJSON from './Pool.json'

export enum PoolEvent {
  ALL = 'allEvents',
  BOUGHT_TICKETS = 'BoughtTickets',
  POOL_LOCKED = 'PoolLocked',
  POOL_UNLOCKED = 'PoolUnlocked',
  POOL_COMPLETE = 'PoolComplete',
  OWNERSHIP_TRANSFERRED = 'OwnershipTransferred',
  WITHDRAWN = 'Withdrawn',
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

export interface PastPoolEvents {
  [PoolEvent.BOUGHT_TICKETS]: Purchase[]
  [PoolEvent.WITHDRAWN]: Withdrawal[]
}

export interface PoolInstance {
  buyTickets: (numTix: number, account: string, callback: OnConfirmationHandler) => Promise<void>
  complete: (address: string, secret: string, callback: OnConfirmationHandler) => Promise<void>
  getEntry: (account: string) => Promise<any>
  getInfo: () => Promise<PoolInfo>
  getPastEvents: (type?: PoolEvent, options?: any) => Promise<PastPoolEvents>
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

  const _getPastEvents = (
    type: PoolEvent = PoolEvent.ALL,
    options: any = allEventsOptions,
  ): Promise<any> =>
    contract.getPastEvents(type, options).then((evts: PoolEventResponse[]) => groupBy(
      evts.map(evt => {
        const { event, returnValues, transactionHash } = evt
        const newEvent = {
          event,
          transactionHash: transactionHash,
        }
        switch (event) {
          case PoolEvent.WITHDRAWN:
            return {
              ...newEvent,
              amount: Number(fromWei(returnValues.amount.toString())),
              destination: returnValues.sender,
            }
          case PoolEvent.OWNERSHIP_TRANSFERRED:
            return {
              ...newEvent,
              previousOwner: returnValues.previousOwner,
              newOwner: returnValues.newOwner,
            }
          case PoolEvent.BOUGHT_TICKETS:
            return {
              ...newEvent,
              buyer: returnValues.sender,
              tickets: returnValues.count.toNumber(),
              total: Number(fromWei(returnValues.totalPrice.toString())),
            }
          case PoolEvent.POOL_LOCKED:
          case PoolEvent.POOL_UNLOCKED:
          case PoolEvent.POOL_COMPLETE:
          default:
            return newEvent
        }
      }),
      'event',
    ))

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
    isOwner: _isOwner,
    lock: _lock,
    methodDocs: _methodDocs,
    netWinnings: _netWinnings,
    unlock: _unlock,
    winnings: _winnings,
    withdraw: _withdraw,
  }
}
