import BN from 'bn.js'
import { pick } from 'lodash'
import { EventData } from 'web3-eth-contract'
import { getContract, toBn } from '../../web3'
import { allEventsOptions, OnConfirmationHandler, tokenContract } from '../contract.model'
import PoolContractJSON from './Pool.json'
import {
  defaultPastPoolEvents,
  PastPoolEvents,
  PoolContractState,
  PoolEvent,
  PoolInfo,
  PoolInstance,
  updatePastEvents,
} from './pool.model'

const pAbi: any = PoolContractJSON.abi

export const PoolContract = async (
  poolAddress: string,
  playerAddress: string,
): Promise<PoolInstance> => {
  const contract = getContract(pAbi, poolAddress)
  const {
    balanceOf,
    buyTickets,
    complete,
    feeAmount,
    getEntry,
    getInfo,
    isOwner,
    lock,
    netWinnings,
    owner,
    unlock,
    winnings,
    withdraw,
  } = contract.methods

  const _balanceOf = async (address: string) => toBn(await balanceOf(address).call())

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

  const _feeAmount = async (): Promise<BN> => toBn(await feeAmount().call())

  const _getEntry = async (account: string) => {
    const e = await getEntry(account).call()
    return {
      ...e,
      amount: toBn(e.amount),
      ticketCount: toBn(e.ticketCount),
      withdrawn: toBn(e.withdrawn),
    }
  }

  const _getInfo = async () => {
    const raw = await getInfo()
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
    return {
      ...raw,
      entryTotal: toBn(raw.entryTotal),
      maxPoolSize: toBn(raw.maxPoolSize),
      participantCount: toBn(raw.participantCount),
      supplyBalanceTotal: toBn(raw.supplyBalanceTotal),
      ticketCost: toBn(raw.ticketCost),
    }
  }

  const _getPastEvents = (type: PoolEvent = PoolEvent.ALL, options: any = allEventsOptions) =>
    contract.getPastEvents(type, options)

  const _isOwner = (address: string) => isOwner().call({ from: address })

  const _lock = (address: string, secretHash: string, callback: OnConfirmationHandler) =>
    lock(secretHash)
      .send({ from: address })
      .on('confirmation', callback)

  const _getNetWinnings = async (address: string) =>
    toBn(await netWinnings().call({ from: address }))

  const _getOwner = () => owner.call()

  const _unlock = (address: string, callback: OnConfirmationHandler) =>
    unlock()
      .send({ from: address })
      .on('confirmation', callback)

  const _winnings = async (address: string) => toBn(await winnings(address).call())

  const _withdraw = (account: string, callback: OnConfirmationHandler) =>
    withdraw()
      .send({ from: account, value: 0 })
      .on('confirmation', callback)

  let pastEvents: PastPoolEvents = defaultPastPoolEvents
  const state: PoolContractState = {
    allowance: toBn(0),
    balance: toBn(0),
    entry: await _getEntry(playerAddress),
    fee: toBn(0),
    grossWinnings: toBn(0),
    info: await _getInfo(),
    netWinnings: toBn(0),
    owner: await _getOwner(),
    pastEvents: defaultPastPoolEvents,
    playerAddress,
  }

  const setPlayerAddress = async (address: string) => {
    state.playerAddress = address
    state.allowance = await tokenContract.allowance(playerAddress, contract.address)
    state.balance = await _balanceOf(playerAddress)
    state.entry = await _getEntry(playerAddress)
    state.fee = await _feeAmount()
    state.grossWinnings = await _winnings(playerAddress)
    state.info = await _getInfo()
    state.netWinnings = await _getNetWinnings(playerAddress)
  }

  contract.events
    .allEvents({ fromBlock: 0 })
    .on(
      'data',
      async (event: EventData) => await updatePastEvents(event, state.pastEvents),
    )

  return {
    address: contract.address,
    balanceOf,
    buyTickets: _buyTickets,
    complete: _complete,
    getEntry: _getEntry,
    getInfo: _getInfo,
    getNetWinnings: _getNetWinnings,
    getOwner: _getOwner,
    getPastEvents: _getPastEvents,
    isOwner: _isOwner,
    lock: _lock,
    pastEvents,
    setPlayerAddress,
    state,
    unlock: _unlock,
    winnings: _winnings,
    withdraw: _withdraw,
  }
}
