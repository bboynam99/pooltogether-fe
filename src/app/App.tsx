import React, { useEffect, useState } from 'react'
import { Header } from '../components/Header'
import { Entry } from '../components/entry/Entry'
import { Pool } from '../components/pool/Pool'
import { PoolInstance, PoolEvent } from '../contracts/pool/pool.model'
import { Purchases } from '../components/pool/Purchases'
import { Withdrawals } from '../components/pool/Withdrawals'
import { PoolManager } from '../components/poolManager/PoolManager'
import { PreviousPools } from '../components/PreviousPools'
import { enable, onAccountsChanged, removeAccountsChanged } from '../web3'
import '../styles/App.scss'
import { getUpdatedAppState, IAppState } from './app.model'

const loading = <div style={{ margin: 20 }}>Loading...</div>

const App: React.FC = () => {
  const [accounts, setAccounts] = useState<string[]>([])
  const [appState, setAppState] = useState<IAppState | null>()
  const [poolToView, setPoolToView] = useState<string>('1')

  useEffect(() => {
    enable().then(setAccounts)
    onAccountsChanged(setAccounts)
    return () => removeAccountsChanged(setAccounts)
  }, [])

  const update = (confirmationNum: number) => {
    if (confirmationNum > 1) return
    if (accounts.length)
      getUpdatedAppState(accounts, poolToView).then(setAppState)
  }

  const updateEffectHandler = () => {
    if (!accounts.length) return
    update(1)
  }

  useEffect(updateEffectHandler, [accounts])

  if (!appState) return loading

  const {
    isComplete,
    // isLocked,
    isOpen,
    isPoolManager,
    // isPoolOwner,
    // isUnlocked,
    isWinner,
    // pool,
    poolManagerInfo,
    manager,
    tokenContract,
  } = appState

  const pool = manager.state.pools[poolToView]
  console.log('new pool')

  return (
    <div className="App">
      {appState ? (
        <div className="grid-container">
          <Header />

          <div className="menu">
            {isPoolManager && (
              <PoolManager
                accounts={accounts}
                manager={manager}
                currentPoolComplete={isComplete}
                onConfirmation={update}
                poolManagerInfo={poolManagerInfo}
              />
            )}
            <PreviousPools
              address={accounts[0]}
              currentPoolAddress={pool.address}
              pools={manager.pools}
              onConfirmation={update}
              setPoolToView={setPoolToView}
            />
          </div>

          <div className="content">
            <div
              style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
            >
              <Pool account={accounts[0]} pool={pool} update={update} />
              <Entry
                playerAddress={accounts[0]}
                isComplete={isComplete}
                isOpen={isOpen}
                isWinner={isWinner}
                pool={pool}
                tokenContract={tokenContract}
                update={update}
              />
            </div>

            <hr />
            <Purchases address={accounts[0]} pool={pool} />
            <Withdrawals withdrawals={pool.state.pastEvents[PoolEvent.WITHDRAWN]} />
          </div>
        </div>
      ) : (
        loading
      )}
    </div>
  )
}

export default App
