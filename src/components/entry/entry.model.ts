import BN from 'bn.js'

export interface EntryInfo {
  addr: string
  amount: BN
  ticketCount: BN
  withdrawn: BN
}
