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
  return (
    <div className="poolInfo cell">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: '10px 0' }}>Current Pool Info</h1>
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
      <div>
        <table>
          <tbody>
            <tr>
              <td>
                <strong>Address:</strong>
              </td>
              <td>
                <EtherscanLink target={pool.address} type="address" />
              </td>
            </tr>
            {[
              'winner',
              'poolState',
              'participantCount',
              'ticketCost',
              'startBlock',
              'endBlock',
              'entryTotal',
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
                case 'poolState':
                  value = PoolState[value]
                  break
                default:
                  break
              }
              return (
                <tr key={name}>
                  <td>
                    <strong>{startCase(name)}:</strong>
                  </td>
                  <td
                    style={{
                      color:
                        value === 'OPEN'
                          ? 'green'
                          : ['COMPLETE', 'LOCKED', 'UNLOCKED'].includes(value)
                          ? 'red'
                          : '#000',
                    }}
                  >
                    {value}
                  </td>
                </tr>
              )
            })}
            <tr>
              <td>
                <strong>Gross Winnings:</strong>
              </td>
              <td>{`${fromWei(String(Number(pool.fee) + Number(pool.netWinnings)))} DAI`}</td>
            </tr>
            <tr>
              <td>
                <strong>Fee:</strong>
              </td>
              <td>{fromWei(pool.fee.toString())} DAI</td>
            </tr>
            <tr>
              <td>
                <strong>Net Winnings:</strong>
              </td>
              <td>{fromWei(pool.netWinnings.toString())} DAI</td>
            </tr>
            <tr>
              <td>
                <strong>Total Balance:</strong>
              </td>
              <td>{fromWei(pool.info.supplyBalanceTotal.toString())} DAI</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
