import React from 'react'
import { EtherscanLink } from '../../components/EtherscanLink'
import { Withdrawal } from './pool.model'
import { sumBy } from 'lodash'

import './pool.scss'

interface WithdrawalsProps {
  withdrawals: Withdrawal[]
}

export const Withdrawals: React.FC<WithdrawalsProps> = ({ withdrawals }: WithdrawalsProps) => (
  <div>
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <h1>Withdrawals</h1>
      <span>
        <strong>Total withdrawn:</strong> {sumBy(withdrawals, 'amount')} DAI
      </span>
    </div>
    {withdrawals.length ? (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'space-between',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 10px',
            borderBottom: '1px solid #555',
          }}
        >
          <strong>Destination</strong>
          <strong style={{ textAlign: 'right' }}>Amount</strong>
        </div>
        {withdrawals.map(w => (
          <div
            key={w.transactionHash}
            className="row withdrawal"
          >
            <EtherscanLink target={w.destination} type="tx"/>
            <div style={{ textAlign: 'right' }}>{w.amount} DAI</div>
          </div>
        ))}
      </div>
    ) : (
      <span>There are no withdrawals</span>
    )}
  </div>
)
