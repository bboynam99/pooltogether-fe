import BN from 'bn.js'
import { ContractEventResponse, OnConfirmationHandler } from '../contract.model'
import { PoolInstance } from '../pool/pool.model'

export enum PoolManagerEvent {
  ALL = 'allEvents',
  LOCK_DURATION_CHANGED = 'LockDurationChanged',
  POOL_CREATED = 'PoolCreated',
  FEE_FRACTION_CHANGED = 'FeeFractionChanged',
  ALLOW_LOCK_ANYTIME_CHANGED = 'AllowLockAnytimeChanged',
  OPEN_DURATION_CHANGED = 'OpenDurationChanged',
  OWNERSHIP_TRANSFERRED = 'OwnershipTransferred',
  TICKET_PRICE_CHANGED = 'TicketPriceChanged',
}

export interface PoolManagerOwnershipChangedEvent extends ContractEventResponse {
  newOwner: string
  previousOwner: string
}

export interface PoolCreatedEvent extends ContractEventResponse {
  number: BN
  pool: string
}

export interface PoolParamDurationChangedEvent extends ContractEventResponse {
  durationInBlocks: BN
}

export interface TicketPriceChangedEvent extends ContractEventResponse {
  ticketPrice: BN
}

export interface AllowLockAnyTimeChangedEvent extends ContractEventResponse {
  allowLockAnytime: boolean
}

export interface FeeFractionChangedEvent extends ContractEventResponse {
  feeFractionFixedPoint18: BN
}

export interface PastPoolManagerEvents {
  [PoolManagerEvent.LOCK_DURATION_CHANGED]: PoolParamDurationChangedEvent[]
  [PoolManagerEvent.POOL_CREATED]: PoolCreatedEvent[]
  [PoolManagerEvent.FEE_FRACTION_CHANGED]: FeeFractionChangedEvent[]
  [PoolManagerEvent.ALLOW_LOCK_ANYTIME_CHANGED]: AllowLockAnyTimeChangedEvent[]
  [PoolManagerEvent.OPEN_DURATION_CHANGED]: PoolParamDurationChangedEvent[]
  [PoolManagerEvent.OWNERSHIP_TRANSFERRED]: PoolManagerOwnershipChangedEvent[]
  [PoolManagerEvent.TICKET_PRICE_CHANGED]: TicketPriceChangedEvent[]
}

export interface PoolManagerInfo {
  _currentPool: string
  _feeFractionFixedPoint18: BN
  _lockDurationInBlocks: BN
  _openDurationInBlocks: BN
  _poolCount: BN
  _ticketPrice: BN
}

export interface PoolManagerInstance {
  createPool: (account: string, callback: OnConfirmationHandler) => Promise<void>
  currentPool: PoolInstance
  isManager: (account: string) => Promise<boolean>
  getInfo: () => Promise<PoolManagerInfo>
  getPastEvents: () => Promise<PastPoolManagerEvents>
  methodDocs: { [key: string]: { notice: string } | string }
  pastEvents: PastPoolManagerEvents
  pools: { [key: string]: PoolInstance }
}
