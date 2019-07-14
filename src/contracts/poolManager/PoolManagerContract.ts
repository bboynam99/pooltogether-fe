import { pick, groupBy } from 'lodash'
import { getContract } from '../../web3'
import { allEventsOptions, OnConfirmationHandler } from '../contract.model'
import { PoolEvent, PoolInstance } from '../pool/pool.model'
import { PoolContract } from '../pool/PoolContract'
import PoolManagerContractJSON from './PoolManager.json'
import {
  PastPoolManagerEvents,
  PoolManagerEvent,
  PoolManagerInfo,
  PoolManagerInstance,
} from './poolManager.model'

const poolManagerAddress = '0xBBF4ddd810690408398c47233D9c1844d8f8D4D6'
const pmAbi: any = PoolManagerContractJSON.abi

export const PoolManagerContract = async (playerAddress: string): Promise<PoolManagerInstance> => {
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

  const _getPastEvents = (
    type: PoolEvent = PoolEvent.ALL,
    options: any = allEventsOptions,
  ): Promise<PastPoolManagerEvents> =>
    contract.getPastEvents(type, options).then(events => {
      const grouped = groupBy(events, 'event')
      return {
        [PoolManagerEvent.LOCK_DURATION_CHANGED]: [],
        [PoolManagerEvent.POOL_CREATED]: grouped[PoolManagerEvent.POOL_CREATED].map(evt => ({
          event: PoolManagerEvent.POOL_CREATED,
          transactionHash: evt.transactionHash,
          address: evt.address,
          number: evt.returnValues.number,
          pool: evt.returnValues.pool,
        })),
        [PoolManagerEvent.FEE_FRACTION_CHANGED]: [],
        [PoolManagerEvent.ALLOW_LOCK_ANYTIME_CHANGED]: [],
        [PoolManagerEvent.OPEN_DURATION_CHANGED]: [],
        [PoolManagerEvent.OWNERSHIP_TRANSFERRED]: [],
        [PoolManagerEvent.TICKET_PRICE_CHANGED]: [],
      }
    })

  const isManager = (account: string) => isOwner().call({ from: account })

  const pastEvents = await _getPastEvents()

  let lastPool = '1'
  const pools = (await Promise.all(
    pastEvents[PoolManagerEvent.POOL_CREATED].map(async evt => ({
      event: evt,
      contract: await PoolContract(evt.pool, playerAddress),
    })),
  )).reduce(
    (prev, next) => {
      lastPool = next.event.number.toString()
      return {
        ...prev,
        [lastPool]: next.contract,
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
    {} as { [key: string]: PoolInstance },
  )

  return {
    createPool: _createPool,
    currentPool: pools[lastPool],
    isManager,
    getInfo: _getInfo,
    getPastEvents: _getPastEvents,
    methodDocs: _methodDocs,
    pastEvents,
    pools,
  }
}
