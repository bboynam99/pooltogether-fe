import React, { ChangeEvent, useState } from 'react'
import { PoolInstance } from '../../contracts/pool/pool.model'
import { toBn } from '../../web3'
import { addressMatch, blankAddress, tokenContract } from '../../contracts/contract.model'
import { WithdrawButton } from '../pool/WithdrawButton'
import { EntryStats } from './EntryStats'
import { NoDice } from './NoDice'
import { WinnerWinner } from './WinnerWinner'

interface EntryProps {
  playerAddress: string
  pool: PoolInstance
  update: (confirmationNumber: number) => void
}

export const Entry: React.FC<EntryProps> = ({
  playerAddress,
  pool,
  update,
}: EntryProps) => {
  const [numTixToBuy, setNumTixToBuy] = useState(1)
  const { allowance, balance, entry, grossWinnings, isComplete, isOpen, netWinnings, winner } = pool.state
  const connect = () => tokenContract.approve(pool.address, playerAddress, update)

  const buy = async () => {
    if (!pool || allowance.lte(toBn(0))) return
    pool.buyTickets(numTixToBuy, playerAddress, (confirmationNumber: number) => {
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
          {allowance.gt(toBn(20)) && (
            <EntryStats
              account={playerAddress}
              entry={entry}
              grossWinnings={grossWinnings}
              netWinnings={netWinnings}
            />
          )}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
            }}
          >
            {addressMatch(playerAddress, winner) && <WinnerWinner balance={balance} netWinnings={netWinnings} />}
            {!addressMatch(playerAddress, winner) && isComplete && <NoDice balance={balance} />}
            <div className="actions">
              {allowance.lte(toBn(0)) && isOpen && (
                <button onClick={connect}>Connect to Pool</button>
              )}
              {isComplete && balance.gt(toBn(0)) && (
                <WithdrawButton address={playerAddress} onConfirmation={update} pool={pool} />
              )}
              {isOpen && allowance.gt(toBn(0)) && (
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
