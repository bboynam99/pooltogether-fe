import React from 'react'
import { EtherscanLink } from '../../components/EtherscanLink'
import { abiEncodeSecret, asciiToHex, fromWei, soliditySha3 } from '../../web3'
import { PoolInstance, PoolState } from './pool.model'
import { PoolStateFns } from './PoolStateFns'
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
  const poolState = PoolState[pool.info.poolState]
  return (
    <div className="poolInfo cell">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: '10px 0' }}>Current Pool Info</h1>
        <h1 style={{ color: poolState === 'OPEN' ? 'green' : 'red' }}>{poolState}</h1>
      </div>
      <div>
        <table>
          <tbody>
            <tr>
              <td style={{ width: 150 }}>
                <strong>Address:</strong>
              </td>
              <td>
                <EtherscanLink target={pool.address} type="address" short={true} />
              </td>
            </tr>
            {[
              'winner',
              'participantCount',
              'ticketCost',
              // 'startBlock',
              // 'endBlock',
              // 'entryTotal',
            ].map((name: string) => {
              let value = get(pool.info, name).toString()
              switch (name) {
                case 'entryTotal':
                case 'ticketCost':
                  value = `${fromWei(value)} DAI`
                  break
                case 'winner':
                  value =
                    value === '0x0000000000000000000000000000000000000000' ? (
                      'TBA'
                    ) : (
                      <EtherscanLink target={value} type="address" short={true} />
                    )
                  break
                default:
                  break
              }
              return (
                <tr key={name}>
                  <td>
                    <strong>{startCase(name)}:</strong>
                  </td>
                  <td>{value}</td>
                </tr>
              )
            })}
            <tr>
              <td>
                <strong>Tickets Sold:</strong>
              </td>
              <td>{fromWei(pool.info.entryTotal.div(pool.info.participantCount))} DAI</td>
            </tr>
            <tr><td colSpan={2}><hr/></td></tr>
            <tr>
              <td>
                <strong>Gross Winnings:</strong>
              </td>
              <td>{fromWei(pool.fee.add(pool.netWinnings))} DAI</td>
            </tr>
            <tr>
              <td>
                <strong>Entry Total:</strong>
              </td>
              <td>{fromWei(pool.info.entryTotal)} DAI</td>
            </tr>
            <tr>
              <td>
                <strong>Total Balance:</strong>
              </td>
              <td>{fromWei(pool.info.supplyBalanceTotal)} DAI</td>
            </tr>
            <tr><td colSpan={2}><hr/></td></tr>
            <tr>
              <td>
                <strong>Fee:</strong>
              </td>
              <td>{fromWei(pool.fee)} DAI</td>
            </tr>
            <tr>
              <td>
                <strong>Net Winnings:</strong>
              </td>
              <td>{fromWei(pool.netWinnings)} DAI</td>
            </tr>
          </tbody>
        </table>
        {pool && isOwner && (
          <PoolStateFns
            account={account}
            isOwner={isOwner}
            pool={pool}
            secret={secret}
            secretHash={secretHash}
            update={update}
          />
        )}
      </div>
    </div>
  )
}
