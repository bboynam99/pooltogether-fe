import { PoolInfo, PoolInstance } from './pool/PoolContract'
import { PoolManagerInstance } from './poolManager/PoolManagerContract'
import { TokenInstance } from './token/TokenContract'

export interface ContractData {
  _isPoolManager: boolean
  _isPoolOwner: boolean
  _poolContract: PoolInstance
  _poolManagerContract: PoolManagerInstance
  _tokenContract: TokenInstance
  _winnings: number
  _balance: number
  _allowance: number
  _entry: any
  _lockDuration: number
  _openDuration: number
  _pool: string
  _poolManagerInfo: any
  _poolInfo: PoolInfo
}

export type OnConfirmationHandler = (confirmationNumber: number) => void
