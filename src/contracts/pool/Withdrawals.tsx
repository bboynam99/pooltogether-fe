import React from 'react'
import { FiExternalLink } from 'react-icons/fi'
import { Withdrawal } from './PoolContract'

interface WithdrawalsProps {
  withdrawals: Withdrawal[]
}

export const Withdrawals: React.FC<WithdrawalsProps> = ({ withdrawals }: WithdrawalsProps) => (
  <div>
    <h1>Withdrawals</h1>
    {withdrawals ? (
      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <th style={{textAlign: 'left'}}>Destination</th>
            <th style={{textAlign: 'right'}}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {withdrawals.map(w => (
            <tr key={w.transactionHash}>
              <td style={{textAlign: 'left'}}>
                <span>{w.destination}</span> <a style={{marginLeft: 20}} href={`https://etherscan.io/tx/${w.transactionHash}`} title="view transaction on Etherscan.io"><FiExternalLink /></a>
              </td>
              <td style={{textAlign: 'right'}}>{w.amount} DAI</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <span>There are no withdrawals</span>
    )}
  </div>
)
