import BN from 'bn.js'
import React from 'react'
import { fromWei } from '../../web3'

interface WinnerWinnerProps {
  balance: BN
  entry: any
  winnings: BN
}

export const WinnerWinner: React.FC<WinnerWinnerProps> = ({
  balance,
  entry,
  winnings,
}: WinnerWinnerProps) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    }}
  >
    <h2 style={{ marginBottom: 0 }}>Winner, winner, chicken dinner!</h2>
    <div style={{ margin: '20px 0' }}>
      <span>You won</span>
      <strong className="green" style={{ fontSize: 38, marginLeft: 10 }}>
        {fromWei(String(winnings.sub(entry.amount)))} DAI
      </strong>
    </div>
    {Number(fromWei(balance)) === 0 && (
      <p>Your winnings have been withdrawn. Thanks for playing!</p>
    )}
  </div>
)
