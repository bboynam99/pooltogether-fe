import React from 'react'
import { fromWei } from '../../web3'

interface WinnerWinnerProps {
  balance: number
  entry: any
  winnings: number
}

export const WinnerWinner: React.FC<WinnerWinnerProps> = ({
  balance,
  entry,
  winnings,
}: WinnerWinnerProps) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
    <h1 style={{ marginBottom: 0 }}>Winner, winner, chicken dinner!</h1>
    <div style={{ margin: '20px 0' }}>
      <span>You won</span>
      <strong style={{ fontSize: 38, marginLeft: 10 }}>
        {fromWei(String(winnings - entry.amount))} DAI
      </strong>
    </div>
    {balance === 0 && <p>Your winnings have been withdrawn. Thanks for playing!</p>}
  </div>
)
