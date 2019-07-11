import { fromWei } from '../web3'
import PoolContract, { PoolInfo, PoolInstance, PoolStats } from './pool/PoolContract'
import PoolManagerContract, { PoolManagerInstance } from './poolManager/PoolManagerContract'
import TokenContract, { TokenInstance } from './token/TokenContract'

export interface ContractData {
  _isPoolManager: boolean
  _isPoolOwner: boolean
  _poolContract: PoolInstance
  _poolManagerContract: PoolManagerInstance
  _tokenContract: TokenInstance
  _netWinnings: number
  _winnings: number
  _balance: number
  _allowance: number
  _entry: any
  _lockDuration: number
  _openDuration: number
  _pool: string
  _poolManagerInfo: any
  _poolInfo: PoolInfo
  _poolStats: PoolStats
}

export type OnConfirmationHandler = (confirmationNumber: number) => void

export const allEventsOptions = {
  fromBlock: 0,
  toBlock: 'latest'
}

export interface PoolEventReponse {
  transactionHash: string
  returnValues: any
}


const _poolManagerContract = PoolManagerContract()
const _tokenContract = TokenContract()

export const getContractData = async (accounts: string[]): Promise<ContractData> => {
  if (!accounts) throw new Error('No accounts supplied')
  const _account = accounts[0]

  // Pool Manager
  const _poolManagerInfo = await _poolManagerContract.getInfo()
  const _isPoolManager = await _poolManagerContract.isManager(_account)

  // Current Pool
  const _poolContract = PoolContract(_poolManagerInfo._currentPool)
  const _poolInfo = await _poolContract.getInfo()
  const _isPoolOwner = await _poolContract.isOwner(_account)
  const _entry = await _poolContract.getEntry(_account)
  const _netWinnings = await _poolContract.netWinnings()
  const _winnings = await _poolContract.winnings(_account)

  // Token
  const allowance = await _tokenContract.allowance(_account, _poolManagerInfo._currentPool)
  const _balance = await _tokenContract.balanceOf(_account)

  const _poolStats = {
    purchases: await _poolContract.getPurchases(),
    withdrawals: await _poolContract.getWithdrawals()
  }

  return {
    _poolContract,
    _poolManagerContract,
    _tokenContract,
    _isPoolManager,
    _isPoolOwner,
    _balance,
    _netWinnings,
    _winnings,
    _allowance: Number(fromWei(allowance.toString())),
    _lockDuration: _poolManagerInfo._lockDurationInBlocks,
    _openDuration: _poolManagerInfo._openDurationInBlocks,
    _pool: _poolManagerInfo._currentPool,
    _entry,
    _poolManagerInfo,
    _poolInfo,
    _poolStats
  }
}
