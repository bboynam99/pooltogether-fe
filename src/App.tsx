import { get, startCase } from 'lodash'
import React, { useEffect, useState } from 'react'

import './App.css'
import { getContractData } from './contracts/contract.model'
import { Entry } from './contracts/entry/Entry'
import {
  PoolInstance,
  PastPoolEvents,
  PoolEvent,
  PoolState,
  PoolInfo,
} from './contracts/pool/pool.model'
import { Purchases } from './contracts/pool/Purchases'
import { Withdrawals } from './contracts/pool/Withdrawals'
import { PoolManager } from './contracts/poolManager/PoolManager'
import { PoolManagerInstance } from './contracts/poolManager/PoolManagerContract'
import { TokenInstance } from './contracts/token/TokenContract'
import {
  abiEncodeSecret,
  asciiToHex,
  enable,
  fromWei,
  onAccountsChanged,
  removeAccountsChanged,
  soliditySha3,
} from './web3'

const secret: any = asciiToHex('test_pool')
const secretHash: string = soliditySha3(abiEncodeSecret(secret))
const loading = <div style={{ margin: 20 }}>Loading...</div>

interface AppState {
  poolContract: PoolInstance
  poolManagerContract: PoolManagerInstance
  tokenContract: TokenInstance
  isPoolManager: boolean
  poolManagerInfo: any
  pool: string
  isPoolOwner: boolean
  poolInfo: PoolInfo
  poolEvents: PastPoolEvents
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

  // show/hide method info
  const [showPmc, setShowPmc] = useState()
  const [showPc, setShowPc] = useState()

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
    poolContract,
    poolManagerContract,
    tokenContract,
    isPoolManager,
    poolManagerInfo,
    pool,
    isPoolOwner,
    poolInfo,
    poolEvents,
    isWinner,
    isOpen,
    isLocked,
    isUnlocked,
    isComplete,
    allowance,
    balance,
    entry,
    winnings,
  } = appState


  const lock = () => poolInfo && isPoolOwner && poolContract.lock(accounts[0], secretHash, update)

  const unlock = () => poolInfo && isPoolOwner && poolContract.unlock(accounts[0], update)

  const complete = () =>
    poolInfo && isPoolOwner && poolContract.complete(accounts[0], secret, update)

  const methodDescription = (value: { notice: string } | string) =>
    typeof value === 'string' ? value : value.notice

  return (
    <div className="App">
      {poolInfo && poolManagerInfo ? (
        <div className="grid-container">
          <div className="header">
            <h1>Pooltogether Test Interface</h1>
          </div>

          <div className="menu cell">
            <h4
              style={{ cursor: 'pointer', color: showPc ? 'red' : '' }}
              onClick={() => {
                setShowPmc(false)
                setShowPc(!showPc)
              }}
            >
              Pool Contract Methods
            </h4>
            <h4
              style={{ cursor: 'pointer', color: showPmc ? 'red' : '' }}
              onClick={() => {
                setShowPc(false)
                setShowPmc(!showPmc)
              }}
            >
              Pool Manager Contract Methods
            </h4>
            <hr />

            {isPoolManager && (
              <PoolManager
                accounts={accounts}
                currentPoolComplete={isComplete}
                onConfirmation={update}
                poolManagerInfo={poolManagerInfo}
              />
            )}

            <h4>Previous Pools</h4>
          </div>

          <Entry address={accounts[0]} allowance={allowance} balance={balance} entry={entry} isComplete={isComplete} isOpen={isOpen} isWinner={isWinner} pool={pool} poolContract={poolContract} tokenContract={tokenContract} update={update} winnings={winnings}/>

          <div className="poolInfo cell">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h2 style={{ marginTop: 0, marginBottom: 0 }}>Current Pool Info</h2>
              <span>
                <strong>Total Pool Capital:</strong> {fromWei(poolInfo.entryTotal.toString())} DAI
              </span>
            </div>
            <h4>Address: {pool}</h4>
            <div className="pool-grid-container">
              {pool && (
                <table className="pool-info-1">
                  <tbody>
                    <tr>
                      <td style={{ width: 50 }}>
                        <strong>State:</strong>
                      </td>
                      <td>
                        <span style={{ fontSize: 50 }}>{PoolState[poolInfo.poolState]}</span>
                      </td>
                    </tr>
                    {isPoolOwner && (
                      <tr>
                        <td colSpan={2}>
                          {isOpen && (
                            <button style={{ width: '100%' }} onClick={lock}>
                              Lock
                            </button>
                          )}
                          {isLocked && (
                            <button style={{ width: '100%' }} onClick={unlock}>
                              Unlock
                            </button>
                          )}
                          {isUnlocked && (
                            <button style={{ width: '100%' }} onClick={complete}>
                              Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
              <div className="pool-info-2">
                <table>
                  <tbody>
                    {[
                      'ticketCost',
                      'supplyBalanceTotal',
                      'maxPoolSize',
                      'startBlock',
                      'endBlock',
                    ].map((name: string) => {
                      const value = get(poolInfo, name).toString()
                      const convert = ['ticketCost', 'maxPoolSize', 'supplyBalanceTotal'].includes(
                        name,
                      )
                      const showWinner = name === 'winner'
                      const winner =
                        showWinner && value === '0x0000000000000000000000000000000000000000'
                          ? 'TBA'
                          : value
                      name = name === 'estimatedInterestFixedPoint18' ? 'estimatedInterest' : name
                      const full = (
                        <tr key={name}>
                          <td>
                            <strong>{startCase(name)}:</strong>
                          </td>
                          <td>{showWinner ? winner : convert ? `${fromWei(value)} DAI` : value}</td>
                        </tr>
                      )
                      return (
                        !['ticketCost', 'supplyBalanceTotal', 'maxPoolSize'].includes(name) && full
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="pool-info-3">
                <table>
                  <tbody>
                    {['participantCount', 'estimatedInterestFixedPoint18', 'winner'].map(
                      (name: string) => {
                        const value = get(poolInfo, name).toString()
                        const convert = ['estimatedInterestFixedPoint18'].includes(name)
                        const showWinner = name === 'winner'
                        const winner =
                          showWinner && value === '0x0000000000000000000000000000000000000000' ? (
                            'TBA'
                          ) : isWinner ? (
                            <strong>You :)</strong>
                          ) : (
                            value
                          )
                        name = name === 'estimatedInterestFixedPoint18' ? 'estimatedInterest' : name
                        return (
                          <tr key={name.toString()}>
                            <td>
                              <strong>{startCase(name)}:</strong>
                            </td>
                            <td>
                              {showWinner ? winner : convert ? `${fromWei(value)} DAI` : value}
                            </td>
                          </tr>
                        )
                      },
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <Purchases address={accounts[0]} purchases={poolEvents[PoolEvent.BOUGHT_TICKETS]} />
            <Withdrawals withdrawals={poolEvents[PoolEvent.WITHDRAWN]} />
          </div>

          <div className="fns cell">
            <div style={{ display: showPmc ? 'block' : 'none' }}>
              <h2>Pool Manager Contract Methods</h2>
              <ul style={{ padding: 0 }}>
                {Object.keys(poolManagerContract.methodDocs).map((name: string) => (
                  <li key={name}>
                    <strong>{name}</strong>
                    <br />
                    <p style={{ marginLeft: 20 }}>
                      {methodDescription(poolManagerContract.methodDocs[name])}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ display: showPc ? 'block' : 'none' }}>
              <h2>Pool Contract Methods</h2>
              <ul style={{ padding: 0 }}>
                {Object.keys(poolContract.methodDocs).map((name: string) => (
                  <li key={name}>
                    <strong>{name}</strong>
                    <br />
                    <p style={{ marginLeft: 20 }}>
                      {methodDescription(poolContract.methodDocs[name])}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        loading
      )}
    </div>
  )
}

export default App
