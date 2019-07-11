import { fromWei } from '../../web3'
import { OnConfirmationHandler } from '../contract.model'
import { groupBy, sumBy } from 'lodash'

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

export interface PurchaseDetail {
  hash: string
  tickets: number
  total: number
}

export interface Purchase {
  buyer: string
  tickets: number
  total: number
  purchases: PurchaseDetail[]
}

export interface Withdrawal {
  destination: string
  amount: number
  transactionHash: string
}

export interface PoolEventResponse {
  transactionHash: string
  event: string
  returnValues: {
    amount?: any
    count?: any
    newOwner?: string
    previousOwner?: string
    sender?: string
    totalAmount?: any
    totalPrice?: any
  }
}

export interface PastPoolEvents {
  [PoolEvent.BOUGHT_TICKETS]: Purchase[]
  [PoolEvent.WITHDRAWN]: Withdrawal[]
  [PoolEvent.POOL_LOCKED]: any[]
  [PoolEvent.POOL_UNLOCKED]: any[]
  [PoolEvent.POOL_COMPLETE]: any[]
  [PoolEvent.OWNERSHIP_TRANSFERRED]: any[]
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

const groupPurchases = (group: any) => {
  const byBuyer = groupBy(group, 'buyer')
  return Object.keys(byBuyer).map(address => {
    const txs = byBuyer[address]
    return {
      event: PoolEvent.BOUGHT_TICKETS,
      purchases: txs.map(tx => ({
        hash: tx.transactionHash,
        tickets: tx.tickets,
        total: tx.total,
      })),
      buyer: address,
      tickets: sumBy(txs, 'tickets'),
      total: sumBy(txs, 'total'),
    }
  })
}

export const formatPastEvents = (events: PoolEventResponse[]): any => {
  let grouped: any = groupBy(
    events.map(evt => {
      const { event, returnValues, transactionHash } = evt
      const newEvent = {
        event,
        transactionHash: transactionHash,
      }
      switch (event) {
        case PoolEvent.BOUGHT_TICKETS:
          return {
            ...newEvent,
            buyer: returnValues.sender,
            tickets: returnValues.count.toNumber(),
            total: Number(fromWei(returnValues.totalPrice.toString())),
          }
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
        case PoolEvent.POOL_LOCKED:
        case PoolEvent.POOL_UNLOCKED:
        case PoolEvent.POOL_COMPLETE:
        default:
          return newEvent
      }
    }),
    'event',
  )
  Object.keys(grouped).forEach(groupName => {
    const group = grouped[groupName]
    if (!group.length || PoolEvent.BOUGHT_TICKETS !== group[0].event) return group
    grouped = {
      ...grouped,
      [PoolEvent.BOUGHT_TICKETS]: groupPurchases(group)
    }
  })
  return grouped
}
