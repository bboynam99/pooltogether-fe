import { getContract, toWei } from '../web3'
import TokenContractJson from '../contracts/Token.json'

export interface TokenInstance {
  allowance: (address: string, poolAddress: string) => Promise<number>
  approve: (poolAddress: string, playerAddress: string, callback: () => void) => Promise<void>
  balanceOf: (address: string) => Promise<number>
  decreaseAllowance: (poolAddress: string, playerAddress: string, callback: () => void) => Promise<void>
}

const tokenAddress = '0x3EF2b228Afb8eAf55c818ee916110D106918bC09'
const tAbi: any = TokenContractJson.abi
const tokenContract = getContract(tAbi, tokenAddress)
let instanceOfContract: TokenInstance

export default (): TokenInstance => {
  if (instanceOfContract) return instanceOfContract

  const { allowance, approve, balanceOf, decreaseAllowance } = tokenContract.methods

  const _allowance = (address: string, poolAddress: string) => allowance(address, poolAddress).call()

  const _approve = (poolAddress: string, playerAddress: string, callback: () => void) => approve(poolAddress, toWei('2000')).send({
    from: playerAddress
  }).on('confirmation', callback)

  const _balanceOf = (address: string) => balanceOf(address).call()

  const _decreaseAllowance = (poolAddress: string, playerAddress: string, callback: () => void) => decreaseAllowance(poolAddress, toWei('20'))
    .send({
      from: playerAddress
    })
    .on('confirmation', callback)
  
  instanceOfContract = {
    allowance: _allowance,
    approve: _approve,
    balanceOf: _balanceOf,
    decreaseAllowance: _decreaseAllowance,
  }

  return instanceOfContract
}
