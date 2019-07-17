import { tokenContract } from '../contracts/contract.model'
import { PoolInstance, PoolState } from '../contracts/pool/pool.model'
import { PoolManagerInfo, PoolManagerInstance } from '../contracts/poolManager/poolManager.model'
import { getUpdatedPoolManager } from '../contracts/poolManager/PoolManagerContract'
import { TokenInstance } from '../contracts/token/TokenContract'

export interface IAppState {
  isComplete: boolean
  isLocked: boolean
  isOpen: boolean
  isPoolManager: boolean
  isPoolOwner: boolean
  isUnlocked: boolean
  isWinner: boolean
  pool: PoolInstance
  poolManagerInfo: PoolManagerInfo
  manager: PoolManagerInstance
  tokenContract: TokenInstance
}

export const getUpdatedAppState = async (
  accounts: string[],
  poolToView: string = '1',
): Promise<IAppState> => {
  if (!accounts) throw new Error('No accounts supplied')
  const _account = accounts[0]

  // Pool Manager
  const manager = await getUpdatedPoolManager(_account)
  await Promise.all(Object.values(manager.state.pools).map(p => p.setPlayerAddress(_account)))
  const managerInfo = await manager.getInfo()

  // Current Pool
  const pool = manager.state.pools[poolToView]

  return {
    isComplete: pool.state.info.poolState === PoolState.COMPLETE,
    isLocked: pool.state.info.poolState === PoolState.LOCKED,
    isOpen: pool.state.info.poolState === PoolState.OPEN,
    isPoolManager: manager.isManager,
    isPoolOwner: await pool.isOwner(_account),
    isUnlocked: pool.state.info.poolState === PoolState.UNLOCKED,
    isWinner: pool.state.info.winner.toLowerCase() === accounts[0].toLowerCase(),
    pool,
    poolManagerInfo: managerInfo,
    manager,
    tokenContract: tokenContract,
  }
}
