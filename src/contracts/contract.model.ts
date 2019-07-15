import BN from 'bn.js'
import { EntryInfo } from '../components/entry/entry.model'
import { PoolInfo, PoolInstance, PoolState } from './pool/pool.model'
import { PoolManagerInfo, PoolManagerInstance } from './poolManager/poolManager.model'
import { getUpdatedPoolManager } from './poolManager/PoolManagerContract'
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
  const managerInstance = await getUpdatedPoolManager(_account)
  const managerInfo = await managerInstance.getInfo()
  // Current Pool
  const _poolContract = managerInstance.currentPool
  const _poolInfo = await _poolContract.getInfo()
  const entry = await _poolContract.getEntry(_account)
  const _winnings = await _poolContract.winnings(_account)

  return {
    allowance: await _tokenContract.allowance(_account, managerInfo._currentPool),
    balance: _winnings.sub(entry.withdrawn),
    currentPool: managerInstance.currentPool,
    entry,
    isPoolManager: managerInstance.isManager,
    isComplete: _poolInfo.poolState === PoolState.COMPLETE,
    isLocked: _poolInfo.poolState === PoolState.LOCKED,
    isOpen: _poolInfo.poolState === PoolState.OPEN,
    isPoolOwner: await _poolContract.isOwner(_account),
    isUnlocked: _poolInfo.poolState === PoolState.UNLOCKED,
    isWinner: _poolInfo.winner.toLowerCase() === accounts[0].toLowerCase(),
    lockDuration: managerInfo._lockDurationInBlocks,
    openDuration: managerInfo._openDurationInBlocks,
    pool: managerInfo._currentPool,
    poolInfo: _poolInfo,
    poolManagerContract: managerInstance,
    poolManagerInfo: managerInfo,
    tokenContract: _tokenContract,
    winnings: _winnings,
    withdrawn: entry.withdrawn,
  }
}
