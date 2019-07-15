import React from 'react'
import { EtherscanLink } from '../EtherscanLink'
import { fromWei, toBn } from '../../web3'
import { Withdrawal } from '../../contracts/pool/pool.model'

import './pool.scss'

interface WithdrawalsProps {
  withdrawals: Withdrawal[]
}

export const Withdrawals: React.FC<WithdrawalsProps> = ({ withdrawals }: WithdrawalsProps) => (
  <div style={{ paddingBottom: 20 }}>
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <h1>Withdrawals</h1>
      <span>
        <strong>Total withdrawn:</strong>{' '}
        {fromWei(withdrawals.reduce((prev, next) => prev.add(next.amount), toBn(0)))} DAI
      </span>
    </div>
    {withdrawals.length ? (
      <table
        style={{
          width: '100%',
          borderSpacing: 0,
        }}
      >
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '20px 0', borderBottom: '1px solid #555' }}>
              Destination
            </th>
            <th style={{ textAlign: 'left', padding: '20px 0', borderBottom: '1px solid #555' }}>
              Transaction Hash
            </th>
            <th style={{ textAlign: 'right', padding: '20px 0', borderBottom: '1px solid #555' }}>
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {withdrawals.map(w => (
            <tr key={w.transactionHash} className="row withdrawal">
              <td>
                <EtherscanLink target={w.destination} type="address" />
              </td>
              <td>
                <EtherscanLink target={w.transactionHash} type="tx" />
              </td>
              <td style={{ textAlign: 'right' }}>{fromWei(w.amount)} DAI</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <span>There are no withdrawals</span>
    )}
  </div>
)
