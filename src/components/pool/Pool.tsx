import React from 'react'
import { EtherscanLink } from '../EtherscanLink'
import { abiEncodeSecret, asciiToHex, fromWei, soliditySha3 } from '../../web3'
import { PoolInstance, PoolState } from '../../contracts/pool/pool.model'
import { PoolStateFns } from './PoolStateFns'

interface PoolProps {
  account: string
  pool: PoolInstance
  update: any
}

export const Pool: React.FC<PoolProps> = ({ account, pool, update }: PoolProps) => {
  const isOwner = account.toLowerCase() === pool.owner.toLowerCase()
  const isComplete = pool.info.poolState === PoolState.COMPLETE
  const isOpen = pool.info.poolState === PoolState.OPEN
  const secret: string = asciiToHex('test_pool')
  const secretHash: string = soliditySha3(abiEncodeSecret(secret))
  const spacer = (
    <tr>
      <td colSpan={2}>
        <hr />
      </td>
    </tr>
  )
  return (
    <div className="poolInfo cell">
      <div className="heading">
        <h1>Current Pool Info</h1>
        <h3 className={isOpen ? 'green' : 'red'}>{PoolState[pool.info.poolState]}</h3>
      </div>
      <div>
        <table>
          <tbody>
            <tr>
              <td className="address">
                <strong>Address:</strong>
              </td>
              <td>
                <EtherscanLink target={pool.address} type="address" short={true} />
              </td>
            </tr>
            <tr>
              <td>
                <strong>Winner:</strong>
              </td>
              <td>
                {pool.info.winner === '0x0000000000000000000000000000000000000000' ? (
                  'TBA'
                ) : (
                  <EtherscanLink target={pool.info.winner} type="address" short={true} />
                )}
              </td>
            </tr>
            <tr>
              <td>
                <strong>Participant Count:</strong>
              </td>
              <td>{pool.info.participantCount.toString()}</td>
            </tr>
            <tr>
              <td>
                <strong>Ticket Cost:</strong>
              </td>
              <td>{fromWei(pool.info.ticketCost)} DAI</td>
            </tr>
            <tr>
              <td>
                <strong>Tickets Sold:</strong>
              </td>
              <td>{pool.info.entryTotal.div(pool.info.ticketCost).toString()}</td>
            </tr>
            {spacer}
            <tr>
              <td>
                <strong>Gross Winnings:</strong>
              </td>
              <td>{isComplete ? fromWei(pool.fee.add(pool.netWinnings)) : 0} DAI</td>
            </tr>
            <tr>
              <td>
                <strong>Entry Total:</strong>
              </td>
              <td>{fromWei(pool.info.entryTotal)} DAI</td>
            </tr>
            <tr>
              <td>
                <strong>Gross Balance:</strong>
              </td>
              <td>{fromWei(pool.info.supplyBalanceTotal)} DAI</td>
            </tr>
            {spacer}
            <tr>
              <td>
                <strong>Fee:</strong>
              </td>
              <td className="red">{isComplete ? fromWei(pool.fee) : 0} DAI</td>
            </tr>
            <tr>
              <td>
                <strong>Net Winnings:</strong>
              </td>
              <td className="net-winnings">{isComplete ? fromWei(pool.netWinnings) : 0} DAI</td>
            </tr>
            {isOwner && !isComplete && spacer}
            {isOwner && !isComplete && (
              <tr>
                <td>
                  <strong>Action:</strong>
                </td>
                <td>
                  <PoolStateFns
                    account={account}
                    isOwner={isOwner}
                    pool={pool}
                    secret={secret}
                    secretHash={secretHash}
                    update={update}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
