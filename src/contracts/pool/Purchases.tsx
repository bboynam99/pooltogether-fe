import React from 'react'
import { sumBy } from 'lodash'
import { EtherscanLink } from '../../components/EtherscanLink'
import { Purchase } from './pool.model'
import './pool.scss'

interface PurchasesProps {
  address: string
  purchases: Purchase[]
}

export const Purchases: React.FC<PurchasesProps> = ({ address, purchases }: PurchasesProps) => (
  <div>
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <h1>Purchases</h1>
      <span>
        <strong>Total deposited:</strong> {sumBy(purchases, 'total')} DAI
      </span>
    </div>
    {purchases.length ? (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'space-between',
          justifyContent: 'center',
          paddingBottom: 20,
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
          <strong>Buyer</strong>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <strong>Tickets</strong>
            <strong style={{ width: 100, marginLeft: 10, textAlign: 'right' }}>Total</strong>
          </div>
        </div>
        {purchases.map(p => (
          <div
            key={p.buyer}
            className="row purchase"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <EtherscanLink target={p.buyer} type="address" />
                <span>{address.toLowerCase() === p.buyer.toLowerCase() && "(that's you, that is!)"}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <div>{p.tickets}</div>
                <div style={{ width: 100, marginLeft: 10, textAlign: 'right' }}>{p.total} DAI</div>
              </div>
            </div>

            <h4 style={{ marginBottom: 10 }}>Transactions</h4>
            {p.purchases.map((purchase, j) => (
              <div
                key={purchase.hash}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  margin: '5px 0',
                  paddingBottom: 5,
                  borderBottom: j === p.purchases.length - 1 ? '' : `1px dotted rgba(0, 0, 0, 0.2)`,
                }}
              >
                <EtherscanLink target={purchase.hash} type="tx" />
                <div
                  style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}
                >
                  <div>{purchase.tickets}</div>
                  <div style={{ width: 100, marginLeft: 10, textAlign: 'right' }}>
                    {purchase.total} DAI
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    ) : (
      <span>There are no purchases</span>
    )}
  </div>
)
