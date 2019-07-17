import { PoolManagerInfo, PoolManagerInstance } from '../contracts/poolManager/poolManager.model'
import { getUpdatedPoolManager } from '../contracts/poolManager/PoolManagerContract'

export interface IAppState {
  poolManagerInfo: PoolManagerInfo
  manager: PoolManagerInstance
}

export const getUpdatedAppState = async (
  accounts: string[],
): Promise<IAppState> => {
  if (!accounts) throw new Error('No accounts supplied')
  const _account = accounts[0]
  const manager = await getUpdatedPoolManager(_account)
  await Promise.all(Object.values(manager.state.pools).map(p => p.setPlayerAddress(_account)))
  return {
    poolManagerInfo: await manager.getInfo(),
    manager,
  }
}
