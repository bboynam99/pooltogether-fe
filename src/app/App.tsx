import React, { useEffect, useState } from 'react'
import { Header } from '../components/Header'
import { Pool } from '../components/pool/Pool'
import { PoolManager } from '../components/poolManager/PoolManager'
import { PreviousPools } from '../components/PreviousPools'
import { enable, onAccountsChanged, removeAccountsChanged } from '../web3'
import './App.scss'
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
    if (accounts.length) getUpdatedAppState(accounts).then(setAppState)
  }

  const updateEffectHandler = () => {
    if (!accounts.length) return
    update(1)
  }

  useEffect(updateEffectHandler, [accounts])

  if (!appState) return loading

  const { poolManagerInfo, manager } = appState
  const pool = manager.pools[poolToView]

  return (
    <div className="App">
      {pool ? (
        <div className="grid-container">
          <Header />

          <div className="menu">
            {manager.state.isManager && (
              <PoolManager
                accounts={accounts}
                manager={manager}
                currentPoolComplete={pool.state.isComplete}
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
            <Pool playerAddress={accounts[0]} pool={pool} update={update} />
          </div>
        </div>
      ) : (
        loading
      )}
    </div>
  )
}

export default App
