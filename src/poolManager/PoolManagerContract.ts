import { getContract } from '../web3'
import PoolManagerContractJSON from '../contracts/PoolManager.json'

export interface PoolManagerInstance {
  createPool: (cb: () => void) => Promise<void>
  isManager: (account: string) => boolean
  getInfo: () => any
  methods: {methods: {[key: string]: {notice: string}}}
}

const poolManagerAddress = '0xBBF4ddd810690408398c47233D9c1844d8f8D4D6'
const pmAbi: any = PoolManagerContractJSON.abi
const managerContract = getContract(pmAbi, poolManagerAddress)

let instanceOfContract: any

export default (account: string) => {
  if (instanceOfContract) return instanceOfContract

  const { createPool, isOwner, getInfo } = managerContract.methods

  const _createPool: PoolManagerInstance['createPool'] = async callback => createPool().send({
    from: account
  }).on('confirmation', callback)

  const _getInfo = () => getInfo().call()

  const isManager = (_account: string): boolean => isOwner().call({from: _account})
  
  instanceOfContract = {
    createPool: _createPool,
    isManager,
    getInfo: _getInfo,
    methods: PoolManagerContractJSON.userdoc.methods
  }

  return instanceOfContract
}
