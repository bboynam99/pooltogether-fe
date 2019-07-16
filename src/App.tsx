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
  const [poolToView, setPoolToView] = useState<string>('')

  useEffect(() => {
    enable().then(setAccounts)
    onAccountsChanged(setAccounts)
    return () => removeAccountsChanged(setAccounts)
  }, [])

  const update = (confirmationNum: number) => {
    if (confirmationNum > 1) return
    getContractData(accounts, poolToView || '1').then(setAppState)
  }

  const updateEffectHandler = () => {
    if (!accounts.length) return
    update(1)
  }

  useEffect(updateEffectHandler, [accounts])

  if (!appState) return loading

  const {
    poolManagerContract,
    tokenContract,
    isPoolManager,
    poolManagerInfo,
    isWinner,
    isOpen,
    isComplete,
    allowance,
    balance,
    entry,
    winnings,
  } = appState

  if (!poolToView) setPoolToView(poolManagerContract.state.lastPoolNum)
  
  const poolToViewInstance: PoolInstance = poolManagerContract.pools[poolToView]

  return (
    <div className="App">
      {appState && poolToViewInstance ? (
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
              currentPoolAddress={poolToViewInstance.address}
              pools={poolManagerContract.pools}
              onConfirmation={update}
              setPoolToView={setPoolToView}
            />
          </div>

          <div className="content">
            <div
              style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
            >
              <Pool account={accounts[0]} pool={poolToViewInstance} update={update} />
              <Entry
                address={accounts[0]}
                allowance={allowance}
                balance={balance}
                entry={poolToViewInstance.entry}
                isComplete={isComplete}
                isOpen={isOpen}
                isWinner={isWinner}
                pool={poolToViewInstance.address}
                poolContract={poolToViewInstance}
                tokenContract={tokenContract}
                update={update}
                winnings={winnings}
              />
            </div>

            <hr />
            <Purchases
              address={accounts[0]}
              purchases={poolToViewInstance.pastEvents[PoolEvent.BOUGHT_TICKETS]}
            />
            <Withdrawals
              withdrawals={poolToViewInstance.pastEvents[PoolEvent.WITHDRAWN]}
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
