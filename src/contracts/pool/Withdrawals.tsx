import React from 'react'
import { Withdrawal } from './PoolContract'

interface WithdrawalsProps {
  withdrawals: Withdrawal[]
}

export const Withdrawals: React.FC<WithdrawalsProps> = ({withdrawals}: WithdrawalsProps) => (
  <div>
    <h1>Withdrawals</h1>
    {withdrawals.length ? <table style={{width: '100%'}}>
      <thead>
      <tr>
        <th>Destination<br/>Transaction Hash</th>
        <th>amount</th>
      </tr>
      </thead>
      <tbody>
      {withdrawals.map((p: Withdrawal) => (<tr key={p.transactionHash}>
        <td>{p.destination}<br/>{p.transactionHash}</td>
        <td>{p.amount}</td>
      </tr>))}
      </tbody>
    </table> : <strong>There are no withdrawals</strong>}
  </div>
)
