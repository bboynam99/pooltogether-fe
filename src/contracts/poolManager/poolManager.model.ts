import { OnConfirmationHandler } from '../contract.model'

export interface ContractEventResponse {
  address: string
  transactionHash: string
  event: string
}

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

export interface PoolManagerEventResponse extends ContractEventResponse {
  event: PoolManagerEvent
}

export interface PoolManagerOwnershipChangedEvent extends PoolManagerEventResponse {
  returnValues: {
    newOwner: string
    previousOwner: string
  }
}

export interface PoolCreatedEvent extends PoolManagerEventResponse {
  returnValues: {
    number: number
    pool: string
  }
}

export interface PoolParamDurationChangedEvent extends PoolManagerEventResponse {
  returnValues: {
    durationInBlocks?: number
  }
}

export interface TicketPriceChangedEvent extends PoolManagerEventResponse {
  returnValues: {
    ticketPrice: number
  }
}

export interface AllowLockAnyTimeChangedEvent extends PoolManagerEventResponse {
  returnValues: {
    allowLockAnytime: boolean
  }
}

export interface FeeFractionChangedEvent extends PoolManagerEventResponse {
  returnValues: {
    feeFractionFixedPoint18: number
  }
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
  _feeFractionFixedPoint18: number
  _lockDurationInBlocks: number
  _openDurationInBlocks: number
  _poolCount: number
  _ticketPrice: number
}

export interface PoolManagerInstance {
  createPool: (account: string, callback: OnConfirmationHandler) => Promise<void>
  isManager: (account: string) => Promise<boolean>
  getInfo: () => Promise<PoolManagerInfo>
  methodDocs: { [key: string]: { notice: string } | string }
}
