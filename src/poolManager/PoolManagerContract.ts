import { getContract } from '../web3'
import PoolManagerContractJSON from '../contracts/PoolManager.json'

export interface PoolManagerInstance {
  createPool: (callback: () => void) => Promise<void>
  isManager: (account: string) => Promise<boolean>
  getInfo: () => any
  methodDocs: {[key: string]: {notice: string} | string}
}

const poolManagerAddress = '0xBBF4ddd810690408398c47233D9c1844d8f8D4D6'
const pmAbi: any = PoolManagerContractJSON.abi
const managerContract = getContract(pmAbi, poolManagerAddress)

let instanceOfContract: PoolManagerInstance

export default (account: string): PoolManagerInstance => {
  if (instanceOfContract) return instanceOfContract

  const { createPool, isOwner, getInfo } = managerContract.methods

  const _createPool = (callback: () => void) => createPool().send({
    from: account
  }).on('confirmation', callback)

  const _getInfo = () => getInfo().call()

  const isManager = (_account: string) => isOwner().call({from: _account})
  
  instanceOfContract = {
    createPool: _createPool,
    isManager,
    getInfo: _getInfo,
    methodDocs: PoolManagerContractJSON.userdoc.methods
  }

  return instanceOfContract
}
