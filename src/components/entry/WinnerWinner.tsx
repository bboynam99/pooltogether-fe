import BN from 'bn.js'
import React from 'react'
import { fromWei } from '../../web3'

interface WinnerWinnerProps {
  balance: BN
  netWinnings: BN
}

export const WinnerWinner: React.FC<WinnerWinnerProps> = ({
  balance,
  netWinnings,
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
        {fromWei(netWinnings)} DAI
      </strong>
    </div>
    {Number(fromWei(balance)) === 0 && (
      <div>
        <div>Your winnings and deposit have been withdrawn.</div>
        <div>Thanks for playing!</div>
      </div>
    )}
  </div>
)
