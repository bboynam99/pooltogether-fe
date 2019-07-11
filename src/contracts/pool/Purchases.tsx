import React from 'react'
import { Purchase } from './PoolContract'

interface PurchasesProps {
  purchases: Purchase[]
}

export const Purchases: React.FC<PurchasesProps> = ({purchases}: PurchasesProps) => (
  <div>
    <h1>Purchases</h1>
    {purchases.length ? <table style={{width: '100%'}}>
      <thead>
      <tr>
        <th>Buyer<br/>Transaction Hash</th>
        <th>Tickets</th>
        <th>Total</th>
      </tr>
      </thead>
      <tbody>
      {purchases.map((p: Purchase) => (<tr key={p.transactionHash}>
        <td>{p.buyer}<br/>{p.transactionHash}</td>
        <td>{p.tickets}</td>
        <td>{p.total}</td>
      </tr>))}
      </tbody>
    </table> : <strong>There are no purchases</strong>}
  </div>
)
