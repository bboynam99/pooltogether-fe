import React from 'react'
import { FiExternalLink } from 'react-icons/fi'
import { Withdrawal } from './pool.model'
import { sumBy } from 'lodash'

interface WithdrawalsProps {
  withdrawals: Withdrawal[]
}

export const Withdrawals: React.FC<WithdrawalsProps> = ({ withdrawals }: WithdrawalsProps) => (
  <div>
    <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between'}}>
      <h1>Withdrawals</h1>
      <span><strong>Total withdrawn:</strong> {sumBy(withdrawals, 'amount')} DAI</span>
    </div>
    {withdrawals ? (<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'space-between', justifyContent: 'center' }}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 10px', borderBottom: '1px solid #555'}}>
          <strong>Destination</strong>
          <strong style={{textAlign: 'right'}}>Amount</strong>
        </div>
        {withdrawals.map((w, i) => (
          <div key={w.transactionHash} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 10px', borderBottom: '1px solid #555', backgroundColor: i % 2 ? 'rgba(100, 100, 100, 0.1)' : 'rgba(100, 100, 100, 0.05)'}}>
            <div>
              <span>{w.destination}</span> <a style={{marginLeft: 20}} href={`https://etherscan.io/tx/${w.transactionHash}`} title="view transaction on Etherscan.io"><FiExternalLink /></a>
            </div>
            <div style={{textAlign: 'right'}}>{w.amount} DAI</div>
          </div>
        ))}
    </div>) : (
      <span>There are no withdrawals</span>
    )}
  </div>
)
