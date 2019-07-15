import BN from 'bn.js'
import { EntryInfo } from '../components/entry/entry.model'
import { PoolInfo, PoolInstance, PoolState } from './pool/pool.model'
import { PoolManagerInfo, PoolManagerInstance } from './poolManager/poolManager.model'
import { PoolManagerContract } from './poolManager/PoolManagerContract'
import TokenContract, { TokenInstance } from './token/TokenContract'

export interface ContractData {
  isPoolManager: boolean
  isPoolOwner: boolean
  currentPool: PoolInstance
  poolManagerContract: PoolManagerInstance
  tokenContract: TokenInstance
  winnings: BN
  balance: BN
  allowance: BN
  entry: EntryInfo
  lockDuration: BN
  openDuration: BN
  pool: string
  poolManagerInfo: PoolManagerInfo
  poolInfo: PoolInfo
  withdrawn: BN
  isOpen: boolean
  isLocked: boolean
  isUnlocked: boolean
  isComplete: boolean
  isWinner: boolean
}

export interface ContractEventResponse {
  address: string
  transactionHash: string
  event: string
}

export type OnConfirmationHandler = (confirmationNumber: number) => void

export const allEventsOptions = {
  fromBlock: 0,
  toBlock: 'latest',
}
export const blankAddress = '0x0000000000000000000000000000000000000000'
const _tokenContract = TokenContract()

export const getContractData = async (accounts: string[]): Promise<ContractData> => {
  if (!accounts) throw new Error('No accounts supplied')
  const _account = accounts[0]

  // Pool Manager
  const _poolManagerContract = await PoolManagerContract(_account)
  const _poolManagerInfo = await _poolManagerContract.getInfo()
  const _isPoolManager = _poolManagerContract.isManager
  // Current Pool
  const _poolContract = _poolManagerContract.currentPool
  const _poolInfo = await _poolContract.getInfo()
  const _isPoolOwner = await _poolContract.isOwner(_account)
  const _entry = await _poolContract.getEntry(_account)
  const _winnings = await _poolContract.winnings(_account)
  const _balance = _winnings.sub(_entry.withdrawn)

  // Token
  const allowance = await _tokenContract.allowance(_account, _poolManagerInfo._currentPool)

  return {
    currentPool: _poolManagerContract.currentPool,
    poolManagerContract: _poolManagerContract,
    tokenContract: _tokenContract,
    isPoolManager: _isPoolManager,
    isPoolOwner: _isPoolOwner,
    balance: _balance,
    winnings: _winnings,
    allowance,
    lockDuration: _poolManagerInfo._lockDurationInBlocks,
    openDuration: _poolManagerInfo._openDurationInBlocks,
    pool: _poolManagerInfo._currentPool,
    entry: _entry,
    poolManagerInfo: _poolManagerInfo,
    poolInfo: _poolInfo,
    withdrawn: _entry.withdrawn,
    isOpen: _poolInfo.poolState === PoolState.OPEN,
    isLocked: _poolInfo.poolState === PoolState.LOCKED,
    isUnlocked: _poolInfo.poolState === PoolState.UNLOCKED,
    isComplete: _poolInfo.poolState === PoolState.COMPLETE,
    isWinner: _poolInfo.winner.toLowerCase() === accounts[0].toLowerCase(),
  }
}
