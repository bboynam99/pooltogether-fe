import React, { useEffect, useState } from 'react'
import BN from 'bn.js'
import { Header } from './components/Header'
import { getContractData } from './contracts/contract.model'
import { Entry } from './components/entry/Entry'
import { EntryInfo } from './components/entry/entry.model'
import { Pool } from './components/pool/Pool'
import { PoolInstance, PoolInfo, PoolEvent } from './contracts/pool/pool.model'
import { Purchases } from './components/pool/Purchases'
import { Withdrawals } from './components/pool/Withdrawals'
import { PoolManager } from './components/poolManager/PoolManager'
import { PoolManagerInfo, PoolManagerInstance } from './contracts/poolManager/poolManager.model'
import { PreviousPools } from './components/PreviousPools'
import { TokenInstance } from './contracts/token/TokenContract'
import { enable, onAccountsChanged, removeAccountsChanged } from './web3'
import './styles/App.scss'

const loading = <div style={{ margin: 20 }}>Loading...</div>

interface AppState {
  currentPool: PoolInstance
  poolManagerContract: PoolManagerInstance
  tokenContract: TokenInstance
  isPoolManager: boolean
  poolManagerInfo: PoolManagerInfo
  pool: string
  isPoolOwner: boolean
  poolInfo: PoolInfo
  isWinner: boolean
  isOpen: boolean
  isLocked: boolean
  isUnlocked: boolean
  isComplete: boolean
  allowance: BN
  balance: BN
  entry: EntryInfo
  withdrawn: BN
  winnings: BN
}

const App: React.FC = () => {
  const [accounts, setAccounts] = useState<string[]>([])
  const [appState, setAppState] = useState<AppState | null>()

  useEffect(() => {
    enable().then(setAccounts)
    onAccountsChanged(setAccounts)
    return () => removeAccountsChanged(setAccounts)
  }, [])

  const update = (confirmationNum: number) => {
    if (confirmationNum > 1) return
    getContractData(accounts).then(setAppState)
  }

  const updateEffectHandler = () => {
    if (!accounts.length) return
    update(1)
  }

  useEffect(updateEffectHandler, [accounts])

  if (!appState) return loading

  const {
    currentPool,
    poolManagerContract,
    tokenContract,
    isPoolManager,
    poolManagerInfo,
    pool,
    isWinner,
    isOpen,
    isComplete,
    allowance,
    balance,
    entry,
    winnings,
  } = appState

  return (
    <div className="App">
      {appState ? (
        <div className="grid-container">
          <Header />

          <div className="menu">
            {isPoolManager && (
              <PoolManager
                accounts={accounts}
                poolManagerContract={poolManagerContract}
                currentPoolComplete={isComplete}
                onConfirmation={update}
                poolManagerInfo={poolManagerInfo}
              />
            )}
            <PreviousPools
              address={accounts[0]}
              currentPoolAddress={poolManagerContract.currentPool.address}
              pools={poolManagerContract.pools}
              onConfirmation={update}
            />
          </div>

          <div className="content">
            <div
              style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
            >
              <Pool account={accounts[0]} pool={poolManagerContract.currentPool} update={update} />
              <Entry
                address={accounts[0]}
                allowance={allowance}
                balance={balance}
                entry={entry}
                isComplete={isComplete}
                isOpen={isOpen}
                isWinner={isWinner}
                pool={pool}
                poolContract={currentPool}
                tokenContract={tokenContract}
                update={update}
                winnings={winnings}
              />
            </div>

            <hr />
            <Purchases
              address={accounts[0]}
              purchases={poolManagerContract.currentPool.pastEvents[PoolEvent.BOUGHT_TICKETS]}
            />
            <Withdrawals
              withdrawals={poolManagerContract.currentPool.pastEvents[PoolEvent.WITHDRAWN]}
            />
          </div>
        </div>
      ) : (
        loading
      )}
    </div>
  )
}

export default App
