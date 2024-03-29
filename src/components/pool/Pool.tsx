import React from 'react'
import {
  calculateWithdrawn,
  PoolEvent,
  PoolInstance,
  PoolState,
} from '../../contracts/pool/pool.model'
import { Entry } from '../entry/Entry'
import { EtherscanLink } from '../EtherscanLink'
import { abiEncodeSecret, asciiToHex, fromWei, soliditySha3 } from '../../web3'
import { PoolStateFns } from './PoolStateFns'
import { Purchases } from './Purchases'
import { Withdrawals } from './Withdrawals'

interface PoolProps {
  playerAddress: string
  pool: PoolInstance
  update: any
}

export const Pool: React.FC<PoolProps> = ({ playerAddress, pool, update }: PoolProps) => {
  const {
    pastEvents,
    isOwner,
    state: { fee, info, isComplete, isOpen, netWinnings },
  } = pool
  const secret: string = asciiToHex('test_pool')
  const secretHash: string = soliditySha3(abiEncodeSecret(secret))
  const totalWithdrawn = calculateWithdrawn(pastEvents[PoolEvent.WITHDRAWN])
  const spacer = (
    <tr>
      <td colSpan={2}>
        <hr />
      </td>
    </tr>
  )
  return (
    <div>
      <div className="pool-grid">
        <div className="poolInfo cell">
          <div className="heading">
            <h1>Current Pool Info</h1>
            <h3 className={isOpen ? 'green' : 'red'}>{PoolState[info.poolState]}</h3>
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
                    {info.winner === '0x0000000000000000000000000000000000000000' ? (
                      'TBA'
                    ) : (
                      <EtherscanLink target={info.winner} type="address" short={true} />
                    )}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Participant Count:</strong>
                  </td>
                  <td>{info.participantCount.toString()}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Ticket Cost:</strong>
                  </td>
                  <td>{fromWei(info.ticketCost)} DAI</td>
                </tr>
                <tr>
                  <td>
                    <strong>Tickets Sold:</strong>
                  </td>
                  <td>{info.entryTotal.div(info.ticketCost).toString()}</td>
                </tr>
                {spacer}
                <tr>
                  <td>
                    <strong>Entry Total:</strong>
                  </td>
                  <td>{fromWei(info.entryTotal)} DAI</td>
                </tr>
                <tr>
                  <td>
                    <strong>Gross Winnings:</strong>
                  </td>
                  <td>{isComplete ? fromWei(fee.add(netWinnings)) : 0} DAI</td>
                </tr>
                <tr>
                  <td>
                    <strong>Gross Balance:</strong>
                  </td>
                  <td>{fromWei(info.supplyBalanceTotal)} DAI</td>
                </tr>
                <tr>
                  <td>
                    <strong>Fee:</strong>
                  </td>
                  <td className="red">{isComplete ? fromWei(fee) : 0} DAI</td>
                </tr>
                <tr>
                  <td>
                    <strong>Withdrawn:</strong>
                  </td>
                  <td className="red">{fromWei(totalWithdrawn)} DAI</td>
                </tr>
                <tr>
                  <td>
                    <strong>Net Balance:</strong>
                  </td>
                  <td>
                    {isComplete ? fromWei(info.supplyBalanceTotal.sub(totalWithdrawn).sub(fee)) : 0}{' '}
                    DAI
                  </td>
                </tr>
                {spacer}
                <tr>
                  <td>
                    <strong>Net Winnings:</strong>
                  </td>
                  <td className="net-winnings">{isComplete ? fromWei(netWinnings) : 0} DAI</td>
                </tr>
                {isOwner(playerAddress) && !isComplete && spacer}
                {isOwner(playerAddress) && !isComplete && (
                  <tr>
                    <td>
                      <strong>Action:</strong>
                    </td>
                    <td>
                      <PoolStateFns
                        playerAddress={playerAddress}
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
        <Entry playerAddress={playerAddress} pool={pool} update={update} />
      </div>
      <hr />
      <Purchases address={playerAddress} pool={pool} />
      <Withdrawals withdrawals={pool.state.pastEvents[PoolEvent.WITHDRAWN]} />
    </div>
  )
}
