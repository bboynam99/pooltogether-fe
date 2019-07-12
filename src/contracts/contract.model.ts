import { fromWei } from '../web3'
import { PastPoolEvents, PoolInfo, PoolInstance, PoolState } from './pool/pool.model'
import PoolContract from './pool/PoolContract'
import { PoolManagerInfo, PoolManagerInstance } from './poolManager/poolManager.model'
import { PoolManagerContract } from './poolManager/PoolManagerContract'
import TokenContract, { TokenInstance } from './token/TokenContract'

export interface ContractData {
  isPoolManager: boolean
  isPoolOwner: boolean
  poolContract: PoolInstance
  poolManagerContract: PoolManagerInstance
  tokenContract: TokenInstance
  netWinnings: number
  winnings: number
  balance: number
  allowance: number
  entry: any
  lockDuration: number
  openDuration: number
  pool: string
  poolManagerInfo: PoolManagerInfo
  poolInfo: PoolInfo
  poolEvents: PastPoolEvents
  withdrawn: number
  isOpen: boolean
  isLocked: boolean
  isUnlocked: boolean
  isComplete: boolean
  isWinner: boolean
}

export type OnConfirmationHandler = (confirmationNumber: number) => void

export const allEventsOptions = {
  fromBlock: 0,
  toBlock: 'latest',
}

const _tokenContract = TokenContract()

export const getContractData = async (accounts: string[]): Promise<ContractData> => {
  if (!accounts) throw new Error('No accounts supplied')
  const _account = accounts[0]

  // Pool Manager
  const _poolManagerContract = PoolManagerContract()
  const _poolManagerInfo = await _poolManagerContract.getInfo()
  const _isPoolManager = await _poolManagerContract.isManager(_account)

  // Current Pool
  const _poolContract = PoolContract(_poolManagerInfo._currentPool)
  const _poolInfo = await _poolContract.getInfo()
  const _poolEvents = await _poolContract.getPastEvents()
  const _isPoolOwner = await _poolContract.isOwner(_account)
  const _entry = await _poolContract.getEntry(_account)
  const _netWinnings = await _poolContract.netWinnings()
  const _winnings = await _poolContract.winnings(_account)
  const _balance = _winnings - _entry.withdrawn

  // Token
  const allowance = await _tokenContract.allowance(_account, _poolManagerInfo._currentPool)

  return {
    poolContract: _poolContract,
    poolManagerContract: _poolManagerContract,
    tokenContract: _tokenContract,
    isPoolManager: _isPoolManager,
    isPoolOwner: _isPoolOwner,
    balance: _balance,
    netWinnings: _netWinnings,
    winnings: _winnings,
    allowance: Number(fromWei(allowance.toString())),
    lockDuration: _poolManagerInfo._lockDurationInBlocks,
    openDuration: _poolManagerInfo._openDurationInBlocks,
    pool: _poolManagerInfo._currentPool,
    entry: _entry,
    poolManagerInfo: _poolManagerInfo,
    poolInfo: _poolInfo,
    poolEvents: _poolEvents,
    withdrawn: _entry.withdrawn,
    isOpen: _poolInfo.poolState === PoolState.OPEN,
    isLocked: _poolInfo.poolState === PoolState.LOCKED,
    isUnlocked: _poolInfo.poolState === PoolState.UNLOCKED,
    isComplete: _poolInfo.poolState === PoolState.COMPLETE,
    isWinner: _poolInfo.winner.toLowerCase() === accounts[0].toLowerCase()
  }
}
