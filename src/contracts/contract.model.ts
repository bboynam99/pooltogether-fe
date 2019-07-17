import TokenContract from './token/TokenContract'

export interface ContractEventResponse {
  address: string
  transactionHash: string
  event: string
}

export type OnConfirmationHandler = (confirmationNumber: number) => void

export const allEventsOptions = {
  fromBlock: 0,
  toBlock: 'latest',
}
export const blankAddress = '0x0000000000000000000000000000000000000000'
export const tokenContract = TokenContract()

export const addressMatch = (address1: string, address2: string): boolean =>
  address1.toLowerCase() === address2.toLowerCase()
