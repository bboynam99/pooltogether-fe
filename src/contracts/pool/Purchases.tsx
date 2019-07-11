import React from 'react'
import { FiExternalLink } from 'react-icons/fi'
import { Purchase } from './PoolContract'

interface PurchasesProps {
  purchases: Purchase[]
}

export const Purchases: React.FC<PurchasesProps> = ({ purchases }: PurchasesProps) => (
  <div>
    <h1>Purchases</h1>
    {purchases ? (
      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <th style={{textAlign: 'left'}}>Buyer</th>
            <th style={{textAlign: 'right'}}>Tickets</th>
            <th style={{textAlign: 'right'}}>Total</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map(p => (
            <tr key={p.transactionHash}>
              <td style={{textAlign: 'left'}}>
                <span>{p.buyer}</span> <a style={{marginLeft: 20}} href={`https://etherscan.io/tx/${p.transactionHash}`} title="view transaction on Etherscan.io"><FiExternalLink /></a>
              </td>
              <td style={{textAlign: 'right'}}>{p.tickets}</td>
              <td style={{textAlign: 'right'}}>{p.total} DAI</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <span>There are no purchases</span>
    )}
  </div>
)
