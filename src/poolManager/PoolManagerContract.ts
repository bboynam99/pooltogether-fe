import { getContract } from '../web3'
import PoolManagerContractJSON from '../contracts/PoolManager.json'

const poolManagerAddress = '0xBBF4ddd810690408398c47233D9c1844d8f8D4D6'
const pmAbi: any = PoolManagerContractJSON.abi
const poolManager = getContract(pmAbi, poolManagerAddress)

let instanceOfContract: any

export interface PoolManagerInstance {
  createPool: (cb: () => void) => Promise<void>
  isManager: (account: string) => boolean
  getInfo: () => any
  methods: {methods: {[key: string]: {notice: string}}}
}

export default (account: string) => {
  if (instanceOfContract) return instanceOfContract
  const manager = poolManager
  const methods = {
    createPool: poolManager.methods.createPool
  }
  const createPool: PoolManagerInstance['createPool'] = async callback => methods.createPool().send({
    from: account
  }).on('confirmation', callback)

  const getInfo = () => manager.methods.getInfo().call()

  const isManager = (_account: string): boolean => manager.methods.isOwner().call({from: _account})
  
  instanceOfContract = {
    createPool,
    isManager,
    getInfo,
    methods: PoolManagerContractJSON.userdoc.methods
  }

  return instanceOfContract
}
