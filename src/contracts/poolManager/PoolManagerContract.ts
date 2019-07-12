import { pick, groupBy } from 'lodash'
import { getContract } from '../../web3'
import { allEventsOptions, OnConfirmationHandler } from '../contract.model'
import { PoolEvent, Purchase, Withdrawal } from '../pool/pool.model'
import PoolManagerContractJSON from './PoolManager.json'
import { PastPoolManagerEvents, PoolManagerInfo, PoolManagerInstance } from './poolManager.model'

const poolManagerAddress = '0xBBF4ddd810690408398c47233D9c1844d8f8D4D6'
const pmAbi: any = PoolManagerContractJSON.abi



export const PoolManagerContract = (): PoolManagerInstance => {
  const contract = getContract(pmAbi, poolManagerAddress)
  
  contract.getPastEvents('allEvents', allEventsOptions).then((e: any[]) => console.log(groupBy(e.map(evt => ({event: evt.event, transactionHash: evt.transactionHash, address: evt.address, returnValues: evt.returnValues})), 'event')))

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
