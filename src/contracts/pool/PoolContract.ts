import { getContract } from '../../web3'
import { pick } from 'lodash'
import { allEventsOptions, OnConfirmationHandler } from '../contract.model'
import PoolContractJSON from './Pool.json'
import { PastPoolEvents, PoolEvent, PoolInfo, PoolInstance, updatePastEvents } from './pool.model'
import { EventData } from 'web3-eth-contract'

const pAbi: any = PoolContractJSON.abi

export const PoolContract = async (poolAddress: string, playerAddress: string): Promise<PoolInstance> => {
  const contract = getContract(pAbi, poolAddress)
  const {
    buyTickets,
    complete,
    feeAmount,
    getEntry,
    getInfo,
    isOwner,
    lock,
    netWinnings,
    unlock,
    winnings,
    withdraw,
  } = contract.methods
  const _methodDocs = PoolContractJSON.userdoc.methods

  let pastEvents: PastPoolEvents = {
    [PoolEvent.BOUGHT_TICKETS]: [],
    [PoolEvent.WITHDRAWN]: [],
    [PoolEvent.POOL_LOCKED]: [],
    [PoolEvent.POOL_UNLOCKED]: [],
    [PoolEvent.POOL_COMPLETE]: [],
    [PoolEvent.OWNERSHIP_TRANSFERRED]: [],
  }

  const _buyTickets = (
    numTix: number,
    account: string,
    callback: (confirmationNumber: number) => void,
  ) =>
    buyTickets(numTix)
      .send({
        from: account,
      })
      .on('confirmation', callback)

  const _complete = (account: string, secret: string, callback: OnConfirmationHandler) =>
    complete(secret)
      .send({
        from: account,
      })
      .on('confirmation', callback)

  const _feeAmount = () => feeAmount().call()

  const _getEntry = (account: string) => getEntry(account).call()

  const _getInfo = () =>
    getInfo()
      .call()
      .then((info: PoolInfo) =>
        pick(info, [
          'entryTotal',
          'startBlock',
          'endBlock',
          'poolState',
          'winner',
          'supplyBalanceTotal',
          'ticketCost',
          'participantCount',
          'maxPoolSize',
          'estimatedInterestFixedPoint18',
          'hashOfSecret',
        ]),
      )

  const _getPastEvents = (
    type: PoolEvent = PoolEvent.ALL,
    options: any = allEventsOptions,
  ): Promise<EventData[]> => contract.getPastEvents(type, options)

  const _isOwner = (address: string) => isOwner().call({ from: address })

  const _lock = (address: string, secretHash: string, callback: OnConfirmationHandler) =>
    lock(secretHash)
      .send({ from: address })
      .on('confirmation', callback)

  const _getNetWinnings = () => netWinnings().call()

  const _unlock = (address: string, callback: OnConfirmationHandler) =>
    unlock()
      .send({ from: address })
      .on('confirmation', callback)

  const _winnings = (address: string) => winnings(address).call()

  const _withdraw = (account: string, callback: OnConfirmationHandler) =>
    withdraw()
      .send({ from: account, value: 0 })
      .on('confirmation', callback)

  const info = await _getInfo()
  const owner = await contract.methods.owner().call()
  const _netWinnings = await _getNetWinnings()
  
  const playerBalance = await contract.methods.balanceOf(playerAddress).call()

  contract.events
    .allEvents({ fromBlock: 0 })
    .on('data', (events: EventData) => pastEvents = updatePastEvents(events, pastEvents))

  return {
    address: contract.address,
    buyTickets: _buyTickets,
    complete: _complete,
    fee: await _feeAmount(),
    getEntry: _getEntry,
    getInfo: _getInfo,
    getNetWinnings: _netWinnings,
    getPastEvents: _getPastEvents,
    info,
    isOwner: _isOwner,
    lock: _lock,
    methodDocs: _methodDocs,
    netWinnings: _netWinnings,
    owner,
    pastEvents,
    playerBalance,
    unlock: _unlock,
    winnings: _winnings,
    withdraw: _withdraw,
  }
}
