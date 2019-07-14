import React from 'react'
import { EtherscanLink } from '../../components/EtherscanLink'
import { abiEncodeSecret, asciiToHex, fromWei, soliditySha3 } from '../../web3'
import { PoolEvent, PoolInstance } from './pool.model'
import { PoolStateTable } from './PoolStateTable'
import { Purchases } from './Purchases'
import { Withdrawals } from './Withdrawals'
import { get, startCase } from 'lodash'

interface PoolProps {
  account: string
  pool: PoolInstance
  update: any
}

export const Pool: React.FC<PoolProps> = ({ account, pool, update }: PoolProps) => {
  const isOwner = account.toLowerCase() === pool.owner.toLowerCase()
  const secret: string = asciiToHex('test_pool')
  const secretHash: string = soliditySha3(abiEncodeSecret(secret))
  return (
    <div className="poolInfo cell">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 0 }}>Current Pool Info</h2>
        <span>
          <strong>Total Pool Capital:</strong> {fromWei(pool.info.entryTotal.toString())} DAI
        </span>
      </div>
      <div style={{display: 'flex'}}>
        <strong>Address:</strong> <EtherscanLink target={pool.address} type="address" style={{marginLeft: 10}} />
      </div>
      <div className="pool-grid-container">
        {pool && (
          <PoolStateTable account={account} isOwner={isOwner} pool={pool} secret={secret} secretHash={secretHash} update={update}/>
        )}
        <div className="pool-info-2">
          <table>
            <tbody>
              {['ticketCost', 'supplyBalanceTotal', 'maxPoolSize', 'startBlock', 'endBlock'].map(
                (name: string) => {
                  const value = get(pool.info, name).toString()
                  const convert = ['ticketCost', 'maxPoolSize', 'supplyBalanceTotal'].includes(name)
                  const showWinner = name === 'winner'
                  const winner =
                    showWinner && value === '0x0000000000000000000000000000000000000000'
                      ? 'TBA'
                      : value
                  name = name === 'estimatedInterestFixedPoint18' ? 'estimatedInterest' : name
                  const full = (
                    <tr key={name}>
                      <td>
                        <strong>{startCase(name)}:</strong>
                      </td>
                      <td>{showWinner ? winner : convert ? `${fromWei(value)} DAI` : value}</td>
                    </tr>
                  )
                  return !['ticketCost', 'supplyBalanceTotal', 'maxPoolSize'].includes(name) && full
                },
              )}
            </tbody>
          </table>
        </div>
        <div className="pool-info-3">
          <table>
            <tbody>
              {['participantCount', 'estimatedInterestFixedPoint18', 'winner'].map(
                (name: string) => {
                  const value = get(pool.info, name).toString()
                  const convert = ['estimatedInterestFixedPoint18'].includes(name)
                  const showWinner = name === 'winner'
                  const winner =
                    showWinner && value === '0x0000000000000000000000000000000000000000'
                      ? 'TBA'
                      : value
                  name = name === 'estimatedInterestFixedPoint18' ? 'estimatedInterest' : name
                  return (
                    <tr key={name.toString()}>
                      <td>
                        <strong>{startCase(name)}:</strong>
                      </td>
                      <td>{showWinner ? winner : convert ? `${fromWei(value)} DAI` : value}</td>
                    </tr>
                  )
                },
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Purchases address={account} purchases={pool.pastEvents[PoolEvent.BOUGHT_TICKETS]} />
      <Withdrawals withdrawals={pool.pastEvents[PoolEvent.WITHDRAWN]} />
    </div>
  )
}
