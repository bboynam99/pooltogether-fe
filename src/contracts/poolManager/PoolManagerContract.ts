import BN from 'bn.js'
import { getContract } from '../../web3'
import { allEventsOptions, OnConfirmationHandler } from '../contract.model'
import { PoolEvent, PoolInstance } from '../pool/pool.model'
import { PoolContract } from '../pool/PoolContract'
import PoolManagerContractJSON from './PoolManager.json'
import {
  defaultPastPoolManagerEvents,
  PastPoolManagerEvents,
  IPoolManagerContract,
  PoolManagerContractState,
  PoolManagerEvent,
  PoolManagerInfo,
  PoolManagerInstance,
} from './poolManager.model'
import { pick, groupBy } from 'lodash'

const poolManagerAddress = '0xBBF4ddd810690408398c47233D9c1844d8f8D4D6'
const pmAbi: any = PoolManagerContractJSON.abi

export const PoolManagerFactory = (): IPoolManagerContract => {
  const contract = getContract(pmAbi, poolManagerAddress)
  const {
    createPool,
    getInfo,
    isOwner,
    setFeeFraction,
    setLockDuration,
    setOpenDuration,
    setTicketPrice,
  } = contract.methods
  const state: PoolManagerContractState = {
    isManager: false,
    lastPoolNum: '1',
    pastEvents: defaultPastPoolManagerEvents,
    playerAddress: '',
    pools: {},
  }

  const _isOwner = (account: string) => isOwner().call({ from: account })

  const isOwnerCheck = async (suggestion: string) =>
    new Promise(async (res, rej) => ((await _isOwner(suggestion)) ? res() : rej()))

  /**
   * @description Creates a new Pool.  There can be no current pool, or the current pool must be complete.
   * Can only be called by the owner.
   * Fires the PoolCreated event.
   * @param address The sender of the
   * @param callback Called on 'confirmation' event
   * @return The address of the new pool
   */
  const _createPool = async (address: string, callback: OnConfirmationHandler) => {
    await isOwnerCheck(address)
    return createPool()
      .send({
        from: address,
      })
      .on('confirmation', callback)
  }

  /**
   * @description Returns information about the PoolManager
   * @return A tuple containing:
   *    _currentPool (the address of the current pool),
   *    _openDurationInBlocks (the open duration in blocks to use for the next pool),
   *    _lockDurationInBlocks (the lock duration in blocks to use for the next pool),
   *    _ticketPrice (the ticket price in DAI for the next pool),
   *    _feeFractionFixedPoint18 (the fee fraction for the next pool),
   *    _poolCount (the number of pools that have been created)
   */
  const _getInfo = () =>
    getInfo()
      .call()
      .then((info: PoolManagerInfo) =>
        pick(info, [
          '_currentPool',
          '_openDurationInBlocks',
          '_lockDurationInBlocks',
          '_ticketPrice',
          '_feeFractionFixedPoint18',
          '_poolCount',
        ]),
      )

  /**
   * @description
   * @param type The 'type' of PoolEvent
   * @param options
   */
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

  /**
   * @description Sets the fee fraction paid out to the Pool owner.
   * Fires the FeeFractionChanged event.
   * Can only be called by the owner. Only applies to subsequent Pools.
   * @param feeFractionFixedPoint18 The fraction to pay out.
   * @param address The address of the sender.
   * Must be between 0 and 1 and formatted as a fixed point number with 18 decimals (as in Ether).
   */
  const _setFeeFraction = async (feeFractionFixedPoint18: BN, address: string) => {
    await isOwnerCheck(address)
    return setFeeFraction(feeFractionFixedPoint18).send({ from: poolManagerAddress })
  }

  /**
   * @description Sets the lock duration in blocks for new Pools.
   * Fires the LockDurationChanged event.
   * Can only be set by the owner.  Only applies to subsequent Pools.
   * @param lockDurationInBlocks The duration, in blocks, that new pools must be locked for.
   * @param address The address of the sender.
   */
  const _setLockDuration = async (lockDurationInBlocks: number, address: string) => {
    await isOwnerCheck(address)
    setLockDuration(lockDurationInBlocks).send({ from: address })
  }

  /**
   * @description Sets the open duration in blocks for new Pools.
   * Fires the OpenDurationChanged event.
   * Can only be set by the owner.  Fires the OpenDurationChanged event.
   * @param openDurationInBlocks The duration, in blocks, that a pool must be open for after it is created.
   * @param address The address of the sender.
   */
  const _setOpenDuration = async (openDurationInBlocks: number, address: string) => {
    await isOwnerCheck(address)
    setOpenDuration(openDurationInBlocks).send({ from: address })
  }

  /**
   * @description Sets the ticket price in DAI.
   * Fires the TicketPriceChanged event.
   * Can only be called by the owner.  Only applies to subsequent Pools.
   * @param ticketPrice The new price for tickets.
   * @param address The address of the sender.
   */
  const _setTicketPrice = async (ticketPrice: BN, address: string) => {
    await isOwnerCheck(address)
    setTicketPrice(ticketPrice).send({ from: address })
  }

  const _updatePools = async () => {
    state.lastPoolNum = '1'
    state.pools = (await Promise.all(
      state.pastEvents[PoolManagerEvent.POOL_CREATED].map(async evt => ({
        event: evt,
        contract: await PoolContract(evt.pool, state.playerAddress),
      })),
    )).reduce(
      (prev, next) => {
        state.lastPoolNum = next.event.number.toString()
        return {
          ...prev,
          [state.lastPoolNum]: next.contract,
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
      {} as { [key: string]: PoolInstance },
    )
  }

  const _setPlayerAddress = async (address: string) => {
    state.playerAddress = address
    state.isManager = await _isOwner(address)
    state.pastEvents = await _getPastEvents()
    await _updatePools()
  }

  return {
    address: contract.address,
    createPool: _createPool,
    getInfo: _getInfo,
    getPastEvents: _getPastEvents,
    isOwner: _isOwner,
    setFeeFraction: _setFeeFraction,
    setLockDuration: _setLockDuration,
    setOpenDuration: _setOpenDuration,
    setPlayerAddress: _setPlayerAddress,
    setTicketPrice: _setTicketPrice,
    state,
  }
}

/**
 * Actual instance of Pool manager. Only created once, right here.
 */
const poolManager = PoolManagerFactory()

/**
 * Returns an updated PoolManager
 * @param playerAddress
 * @return Promise<PoolManagerInstance>
 */
export const getUpdatedPoolManager = async (
  playerAddress: string,
): Promise<PoolManagerInstance> => {
  await poolManager.setPlayerAddress(playerAddress)
  return {
    ...poolManager,
    currentPool: poolManager.state.pools[poolManager.state.lastPoolNum],
    isManager: poolManager.state.isManager,
    pastEvents: poolManager.state.pastEvents,
    pools: poolManager.state.pools,
  }
}
