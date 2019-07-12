import React, { ChangeEvent, useState } from 'react'
import { fromWei } from '../../web3'
import { PoolInstance } from '../pool/pool.model'
import { TokenInstance } from '../token/TokenContract'

interface EntryProps {
  address: string
  allowance: number
  balance: number
  entry: any
  isComplete: boolean
  isOpen: boolean
  isWinner: boolean
  pool: string
  poolContract: PoolInstance
  tokenContract: TokenInstance
  update: (confirmationNumber: number) => void
  winnings: number
}

export const Entry: React.FC<EntryProps> = ({
  address,
  allowance,
  balance,
  entry,
  isComplete,
  isOpen,
  isWinner,
  pool,
  poolContract,
  tokenContract,
  update,
  winnings,
}: EntryProps) => {

  const [numTixToBuy, setNumTixToBuy] = useState(1)

  const connect = () => tokenContract.approve(pool, address, update)

  const decreaseAllowance = () => tokenContract.decreaseAllowance(pool, address, update)

  const buy = async () => {
    if (!poolContract || allowance <= 0) return
    poolContract.buyTickets(numTixToBuy, address, (confirmationNumber: number) => {
      if (confirmationNumber === 1) setNumTixToBuy(1)
      update(confirmationNumber)
    })
  }

  const withdraw = () => poolContract && entry.amount > 0 && poolContract.withdraw(address, update)

  return entry ? (
    <div className="entry cell">
      <h2>Your Pooltogether</h2>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <table>
            <tbody>
              <tr>
                <td>
                  <strong>Address:</strong>
                </td>
                <td>{address}</td>
              </tr>
              <tr>
                <td>
                  <strong>Tickets:</strong>
                </td>
                <td>{entry.ticketCount.toNumber()}</td>
              </tr>
              <tr>
                <td>
                  <strong>Deposit:</strong>
                </td>
                <td>{fromWei(entry.amount.toString())} DAI</td>
              </tr>
              <tr>
                <td>
                  <strong>Winnings:</strong>
                </td>
                <td>{fromWei(String(winnings - entry.amount))} DAI</td>
              </tr>
              <tr>
                <td>
                  <strong>Withdrawn:</strong>
                </td>
                <td>{fromWei(entry.withdrawn.toString())} DAI</td>
              </tr>
              <tr>
                <td>
                  <strong>Balance:</strong>
                </td>
                <td>{fromWei(String(balance))} DAI</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          style={{
            minHeight: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          {isWinner && (
            <div>
              <h1 style={{ textAlign: 'right' }}>Winner, winner, chicken dinner!</h1>
              <p
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}
              >
                <span>You won</span>
                <strong style={{ fontSize: 38, marginLeft: 10 }}>
                  {fromWei(String(winnings - entry.amount))} DAI
                </strong>
              </p>
            </div>
          )}
          {isComplete && isWinner && balance === 0 && (
            <p>Your winnings have been withdrawn. Thanks for playing!</p>
          )}
          {isComplete && !isWinner && balance === 0 && (
            <div style={{ textAlign: 'right' }}>
              <h1>No dice :(</h1>
              <p>Thanks for playing, and better luck next time!</p>
              <h3>Your deposit has been withdrawn</h3>
            </div>
          )}
          {!isComplete && (
            <div>
              <strong>Allowance:</strong> {allowance} DAI
            </div>
          )}
          {allowance <= 0 && !isComplete ? (
            <button onClick={connect}>Connect to Pool</button>
          ) : (
            <div>
              {!isComplete && (
                <input
                  type="number"
                  min={1}
                  value={numTixToBuy}
                  onChange={(evt: ChangeEvent<HTMLInputElement>) =>
                    setNumTixToBuy(Number(evt.target.value))
                  }
                />
              )}
              <div className="actions">
                {isComplete && balance > 0 && <button onClick={withdraw}>Withdraw</button>}
                {isOpen && allowance > 0 && (
                  <button onClick={buy}>
                    Buy {numTixToBuy === 1 ? 'a' : numTixToBuy} Ticket
                    {numTixToBuy > 1 && 's'}
                  </button>
                )}
                {!isComplete && <button onClick={decreaseAllowance}>Decrease Allowance</button>}
              </div>
            </div>
          )}
        </div>
      </div>
      <hr />
    </div>
  ) : null
}
