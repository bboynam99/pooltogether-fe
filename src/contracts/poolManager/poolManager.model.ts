import { OnConfirmationHandler } from '../contract.model'

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
