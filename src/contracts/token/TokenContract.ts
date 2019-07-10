import { getContract, toWei } from '../../web3'
import { OnConfirmationHandler } from '../contract.model'
import TokenContractJson from './Token.json'

export interface TokenInstance {
  allowance: (owner: string, spender: string) => Promise<number>
  approve: (spender: string, owner: string, callback: OnConfirmationHandler) => Promise<void>
  balanceOf: (address: string) => Promise<number>
  decreaseAllowance: (
    poolAddress: string,
    playerAddress: string,
    callback: OnConfirmationHandler,
  ) => Promise<void>
}

const tokenAddress = '0x3EF2b228Afb8eAf55c818ee916110D106918bC09'
const tAbi: any = TokenContractJson.abi

export default (): TokenInstance => {
  const tokenContract = getContract(tAbi, tokenAddress)
  const { allowance, approve, balanceOf, decreaseAllowance } = tokenContract.methods

  const _allowance = (owner: string, spender: string) => allowance(owner, spender).call()

  const _approve = (spender: string, owner: string, callback: OnConfirmationHandler) =>
    approve(spender, toWei('2000'))
      .send({
        from: owner,
      })
      .on('confirmation', callback)

  const _balanceOf = (address: string) => balanceOf(address).call()

  const _decreaseAllowance = (
    poolAddress: string,
    playerAddress: string,
    callback: OnConfirmationHandler,
  ) =>
    decreaseAllowance(poolAddress, toWei('20'))
      .send({
        from: playerAddress,
      })
      .on('confirmation', callback)

  return {
    allowance: _allowance,
    approve: _approve,
    balanceOf: _balanceOf,
    decreaseAllowance: _decreaseAllowance,
  }
}
