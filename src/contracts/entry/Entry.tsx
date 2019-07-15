import React, { ChangeEvent, useState } from 'react'
import { blankAddress } from '../contract.model'
import { PoolInstance } from '../pool/pool.model'
import { WithdrawButton } from '../pool/WithdrawButton'
import { TokenInstance } from '../token/TokenContract'
import { EntryStats } from './EntryStats'
import { NoDice } from './NoDice'
import { WinnerWinner } from './WinnerWinner'

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

  const buy = async () => {
    if (!poolContract || allowance <= 0) return
    poolContract.buyTickets(numTixToBuy, address, (confirmationNumber: number) => {
      if (confirmationNumber === 1) setNumTixToBuy(1)
      update(confirmationNumber)
    })
  }

  const isBlankAddr = entry.addr === blankAddress

  return (
    <div>
      <h1 style={{ margin: '10px 0' }}>Your Entry</h1>

      {isBlankAddr && !isOpen ? (
        <p>You did not enter this pool</p>
      ) : (
        <div>
          {allowance > 20 && <EntryStats account={address} entry={entry} winnings={winnings} />}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
            }}
          >
            {isWinner && <WinnerWinner balance={balance} entry={entry} winnings={winnings} />}
            {!isWinner && isComplete && <NoDice balance={balance} />}
            <div className="actions">
              {allowance <= 0 && isOpen && <button onClick={connect}>Connect to Pool</button>}
              {isComplete && balance > 0 && (
                <WithdrawButton address={address} onConfirmation={update} pool={poolContract} />
              )}
              {isOpen && allowance > 0 && (
                <div>
                  <input
                    type="number"
                    min={1}
                    value={numTixToBuy}
                    onChange={(evt: ChangeEvent<HTMLInputElement>) =>
                      setNumTixToBuy(Number(evt.target.value))
                    }
                  />
                  <br />
                  <button style={{ width: '100%' }} onClick={buy}>
                    Buy {numTixToBuy === 1 ? 'a' : numTixToBuy} Ticket
                    {numTixToBuy > 1 && 's'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
