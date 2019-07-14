import React, { useEffect, useState } from 'react'

import './App.css'
import { Header } from './components/Header'
import { getContractData } from './contracts/contract.model'
import { Entry } from './contracts/entry/Entry'
import { Pool } from './contracts/pool/Pool'
import { PoolInstance, PoolInfo } from './contracts/pool/pool.model'
import { PoolManager } from './contracts/poolManager/PoolManager'
import { PoolManagerInfo, PoolManagerInstance } from './contracts/poolManager/poolManager.model'
import { PreviousPools } from './contracts/poolManager/PreviousPools'
import { TokenInstance } from './contracts/token/TokenContract'
import { enable, onAccountsChanged, removeAccountsChanged } from './web3'

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
  allowance: number
  balance: number
  entry: any
  withdrawn: number
  winnings: number
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
            <PreviousPools address={accounts[0]} currentPoolAddress={poolManagerContract.currentPool.address} pools={poolManagerContract.pools} onConfirmation={update}/>
          </div>

          <div className="content">
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

            <Pool account={accounts[0]} pool={poolManagerContract.currentPool} update={update} />
          </div>

        </div>
      ) : (
        loading
      )}
    </div>
  )
}

export default App
