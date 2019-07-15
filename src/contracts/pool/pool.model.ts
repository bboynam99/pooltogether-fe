import { toBn } from '../../web3'
import { ContractEventResponse, OnConfirmationHandler } from '../contract.model'
import BN from 'bn.js'
import { EntryInfo } from '../../components/entry/entry.model'
import { EventData } from 'web3-eth-contract'

export enum PoolState {
  OPEN,
  LOCKED,
  UNLOCKED,
  COMPLETE,
}

export interface PoolInfo {
  entryTotal: BN
  startBlock: BN
  endBlock: BN
  poolState: PoolState
  winner: string
  supplyBalanceTotal: BN
  ticketCost: BN
  participantCount: BN
  maxPoolSize: BN
  estimatedInterestFixedPoint18: BN
  hashOfSecret: string
}

export interface PurchaseDetail {
  hash: string
  tickets: BN
  total: BN
}

export interface Purchase {
  buyer: string
  tickets: BN
  total: BN
  purchases: PurchaseDetail[]
}

export interface Withdrawal {
  destination: string
  amount: BN
  transactionHash: string
}

export enum PoolEvent {
  ALL = 'allEvents',
  BOUGHT_TICKETS = 'BoughtTickets',
  POOL_LOCKED = 'PoolLocked',
  POOL_UNLOCKED = 'PoolUnlocked',
  POOL_COMPLETE = 'PoolComplete',
  OWNERSHIP_TRANSFERRED = 'OwnershipTransferred',
  WITHDRAWN = 'Withdrawn',
}

export interface BoughtTicketsEvent extends ContractEventResponse {
  buyer: string
  tickets: BN
  total: BN
}

export interface WithdrawnEvent extends ContractEventResponse {
  amount: BN
  destination: string
}

export interface OwnershipTransferredEvent extends ContractEventResponse {
  previousOwner: string
  newOwner: string
}

export interface PastPoolEvents {
  [PoolEvent.BOUGHT_TICKETS]: Purchase[]
  [PoolEvent.WITHDRAWN]: Withdrawal[]
  [PoolEvent.POOL_LOCKED]: ContractEventResponse[]
  [PoolEvent.POOL_UNLOCKED]: ContractEventResponse[]
  [PoolEvent.POOL_COMPLETE]: ContractEventResponse[]
  [PoolEvent.OWNERSHIP_TRANSFERRED]: OwnershipTransferredEvent[]
}

export interface PoolInstance {
  address: string
  buyTickets: (numTix: number, account: string, callback: OnConfirmationHandler) => Promise<void>
  complete: (address: string, secret: string, callback: OnConfirmationHandler) => Promise<void>
  fee: BN
  getEntry: (account: string) => Promise<EntryInfo>
  getInfo: () => Promise<PoolInfo>
  getNetWinnings: () => Promise<BN>
  getPastEvents: (type?: PoolEvent, options?: any) => Promise<EventData[]>
  info: PoolInfo
  isOwner: (address: string) => Promise<boolean>
  lock: (address: string, secretHash: string, callback: OnConfirmationHandler) => Promise<void>
  methodDocs: { [key: string]: { notice: string } | string }
  netWinnings: BN
  owner: string
  pastEvents: PastPoolEvents
  playerBalance: BN
  unlock: (address: string, callback: OnConfirmationHandler) => Promise<void>
  winnings: (account: string) => Promise<BN>
  withdraw: (account: string, callback: OnConfirmationHandler) => Promise<void>
}

const formatPurchases = (
  { address, event, returnValues: { count, totalPrice, sender }, transactionHash }: EventData,
  pastEvents: PastPoolEvents,
) => {
  const newEvent = {
    address,
    event,
    transactionHash: transactionHash,
  }
  const ticketsAndTotal = {
    tickets: toBn(count),
    total: toBn(totalPrice),
  }
  const existingPurchase = pastEvents[PoolEvent.BOUGHT_TICKETS].find(
    pastEvent => sender === pastEvent.buyer,
  )
  if (existingPurchase) {
    existingPurchase.purchases.push({
      hash: transactionHash,
      ...ticketsAndTotal,
    })
    existingPurchase.tickets = existingPurchase.purchases.reduce(
      (prev, next) => prev.add(next.tickets),
      toBn(0),
    )
    existingPurchase.total = existingPurchase.purchases.reduce(
      (prev, next) => prev.add(next.total),
      toBn(0),
    )
  } else {
    pastEvents[PoolEvent.BOUGHT_TICKETS].push({
      ...newEvent,
      purchases: [
        {
          hash: transactionHash,
          ...ticketsAndTotal,
        },
      ],
      buyer: sender,
      ...ticketsAndTotal,
    })
  }
}

export const updatePastEvents = (evt: EventData, pastEvents: PastPoolEvents): PastPoolEvents => {
  const { event, returnValues, transactionHash } = evt
  const _updated = { ...pastEvents }
  const newEvent = {
    address: evt.address,
    event,
    transactionHash: transactionHash,
  }
  switch (event) {
    case PoolEvent.BOUGHT_TICKETS:
      formatPurchases(evt, _updated)
      break
    case PoolEvent.WITHDRAWN:
      pastEvents[event].push({
        ...newEvent,
        amount: toBn(returnValues.amount),
        destination: returnValues.sender,
      })
      break
    case PoolEvent.OWNERSHIP_TRANSFERRED:
      pastEvents[event].push({
        ...newEvent,
        previousOwner: returnValues.previousOwner,
        newOwner: returnValues.newOwner,
      })
      break
    case PoolEvent.POOL_LOCKED:
    case PoolEvent.POOL_UNLOCKED:
    case PoolEvent.POOL_COMPLETE:
      pastEvents[event].push(newEvent)
      break
    default:
      break
  }
  return _updated
}
