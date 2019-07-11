import { pick } from 'lodash'
import { getContract } from '../../web3'
import { OnConfirmationHandler } from '../contract.model'
import PoolManagerContractJSON from './PoolManager.json'

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

const poolManagerAddress = '0xBBF4ddd810690408398c47233D9c1844d8f8D4D6'
const pmAbi: any = PoolManagerContractJSON.abi

export default (): PoolManagerInstance => {
  const contract = getContract(pmAbi, poolManagerAddress)

  const { createPool, isOwner, getInfo } = contract.methods

  const _methodDocs = PoolManagerContractJSON.userdoc.methods

  const _createPool = (account: string, callback: OnConfirmationHandler) =>
    createPool()
      .send({
        from: account,
      })
      .on('confirmation', callback)

  const _getInfo = () =>
    getInfo()
      .call()
      .then((info: PoolManagerInfo) =>
        pick(info, [
          '_currentPool',
          '_feeFractionFixedPoint18',
          '_lockDurationInBlocks',
          '_openDurationInBlocks',
          '_poolCount',
          '_ticketPrice',
        ]),
      )

  const isManager = (account: string) => isOwner().call({ from: account })

  return {
    createPool: _createPool,
    isManager,
    getInfo: _getInfo,
    methodDocs: _methodDocs,
  }
}