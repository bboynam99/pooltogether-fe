import BN from 'bn.js'
import React from 'react'
import { fromWei } from '../../web3'

interface NoDiceProps {
  balance: BN
}

export const NoDice: React.FC<NoDiceProps> = ({ balance }: NoDiceProps) => {
  return (
    <div style={{ textAlign: 'right' }}>
      <h1>No dice :(</h1>
      <p>Thanks for playing, and better luck next time!</p>
      {Number(fromWei(balance)) === 0 && <p>Your deposit has been withdrawn.</p>}
    </div>
  )
}
