import React, { ChangeEvent, useState } from 'react'
import BN from 'bn.js'
import { fromWei } from '../../web3'
import { blankAddress } from '../../contracts/contract.model'
import { PoolInstance } from '../../contracts/pool/pool.model'
import { WithdrawButton } from '../pool/WithdrawButton'
import { TokenInstance } from '../../contracts/token/TokenContract'
import { EntryInfo } from './entry.model'
import { EntryStats } from './EntryStats'
import { NoDice } from './NoDice'
import { WinnerWinner } from './WinnerWinner'

interface EntryProps {
  address: string
  allowance: BN
  balance: BN
  entry: EntryInfo
  isComplete: boolean
  isOpen: boolean
  isWinner: boolean
  pool: string
  poolContract: PoolInstance
  tokenContract: TokenInstance
  update: (confirmationNumber: number) => void
  winnings: BN
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
    if (!poolContract || Number(fromWei(allowance)) <= 0) return
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
          {Number(fromWei(allowance)) > 20 && (
            <EntryStats account={address} entry={entry} winnings={winnings} />
          )}
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
              {Number(fromWei(allowance)) <= 0 && isOpen && (
                <button onClick={connect}>Connect to Pool</button>
              )}
              {isComplete && Number(fromWei(balance)) > 0 && (
                <WithdrawButton address={address} onConfirmation={update} pool={poolContract} />
              )}
              {isOpen && Number(fromWei(allowance)) > 0 && (
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
