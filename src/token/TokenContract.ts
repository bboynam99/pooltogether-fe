import { getContract, toWei } from '../web3'
import TokenContractJson from '../contracts/Token.json'

export interface TokenInstance {
  approve: (poolAddress: string, playerAddress: string, callback: () => void) => void
  decreaseAllowance: (poolAddress: string, playerAddress: string, callback: () => void) => void
}

const tokenAddress = '0x3EF2b228Afb8eAf55c818ee916110D106918bC09'
const tAbi: any = TokenContractJson.abi
const tokenContract = getContract(tAbi, tokenAddress)
let instanceOfContract: TokenInstance

export default async (): Promise<TokenInstance> => {
  if (instanceOfContract) return instanceOfContract

  const { approve, decreaseAllowance } = tokenContract.methods

  const _approve = (poolAddress: string, playerAddress: string, callback: () => void) => approve(poolAddress, toWei('2000')).send({
    from: playerAddress
  }).on('confirmation', callback)

  const _decreaseAllowance = (poolAddress: string, playerAddress: string, callback: () => void) => decreaseAllowance(poolAddress, toWei('20'))
    .send({
      from: playerAddress
    })
    .on('confirmation', callback)
  
  instanceOfContract = {
    approve: _approve,
    decreaseAllowance: _decreaseAllowance,
  }

  return instanceOfContract
}
