import { get, startCase } from 'lodash'
import React, { ChangeEvent, useEffect, useState } from 'react'

import './App.css'
import { ContractData, getContractData } from './contracts/contract.model'
import {
  PastPoolEvents, PoolEvent,
  PoolInfo,
  PoolInstance,
  PoolState,
} from './contracts/pool/PoolContract'
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

const App: React.FC = () => {
  const [accounts, setAccounts] = useState<string[]>([])

  // contracts
  const [poolContract, setPoolContract] = useState<PoolInstance>()
  const [poolManagerContract, setPoolManagerContract] = useState<PoolManagerInstance>()
  const [tokenContract, setTokenContract] = useState<TokenInstance>()

  // pool manager
  const [isPoolManager, setIsPoolManager] = useState(false)
  const [poolManagerInfo, setPoolManagerInfo] = useState<any>()

  // pool
  const [pool, setPool] = useState()
  const [isPoolOwner, setIsPoolOwner] = useState(false)
  const [poolInfo, setPoolInfo] = useState<PoolInfo>()
  const [poolEvents, setPoolEvents] = useState<PastPoolEvents>()

  // player
  const [isWinner, setIsWinner] = useState(false)
  const [balance, setBalance] = useState()
  const [allowance, setAllowance] = useState()
  const [deposited, setDeposited] = useState()
  const [withdrawn, setWithdrawn] = useState()
  const [entry, setEntry] = useState()
  const [winnings, setWinnings] = useState()
  const [numTixToBuy, setNumTixToBuy] = useState(1)

  // current pool state
  const [isOpen, setIsOpen] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  // show/hide method info
  const [showPmc, setShowPmc] = useState()
  const [showPc, setShowPc] = useState()

  useEffect(() => {
    enable().then((_accounts: string[]) => setAccounts(_accounts))
    onAccountsChanged(setAccounts)
    return () => removeAccountsChanged(setAccounts)
  }, [])

  useEffect(() => {
    if (!accounts.length) return
    getContractData(accounts).then(
      ({
        _isPoolManager,
        _isPoolOwner,
        _poolManagerContract,
        _poolContract,
        _tokenContract,
        _winnings,
        _allowance,
        _entry,
        _pool,
        _poolInfo,
        _poolEvents,
        _poolManagerInfo,
      }: ContractData) => {
        setPoolManagerContract(_poolManagerContract)
        setPoolContract(_poolContract)
        setTokenContract(_tokenContract)

        setIsPoolManager(_isPoolManager)
        setIsPoolOwner(_isPoolOwner)
        setPoolManagerInfo(_poolManagerInfo)

        setPool(_pool)
        setPoolInfo(_poolInfo)
        setPoolEvents(_poolEvents)
        setIsOpen(_poolInfo.poolState === PoolState.OPEN)
        setIsLocked(_poolInfo.poolState === PoolState.LOCKED)
        setIsUnlocked(_poolInfo.poolState === PoolState.UNLOCKED)
        setIsComplete(_poolInfo.poolState === PoolState.COMPLETE)

        setIsWinner(_poolInfo.winner.toLowerCase() === accounts[0].toLowerCase())
        setBalance(_winnings - _entry.withdrawn)
        setDeposited(_entry.amount)
        setWithdrawn(_entry.withdrawn)
        setWinnings(_winnings)
        setAllowance(_allowance)
        setEntry(_entry)
      },
    )
  }, [accounts])

  if (!poolManagerContract || !poolContract || !tokenContract) return loading

  const update = async (confirmationNum: number) => {
    if (confirmationNum > 1) return
    const {
      _allowance,
      _entry,
      _isPoolManager,
      _isPoolOwner,
      _pool,
      _poolContract,
      _poolManagerContract,
      _poolInfo,
      _poolEvents,
      _poolManagerInfo,
      _tokenContract,
      _winnings,
    } = await getContractData(accounts)
    setPoolManagerContract(_poolManagerContract)
    setPoolContract(_poolContract)
    setTokenContract(_tokenContract)

    setIsPoolManager(_isPoolManager)
    setIsPoolOwner(_isPoolOwner)
    setPoolManagerInfo(_poolManagerInfo)

    setPool(_pool)
    setPoolInfo(_poolInfo)
    setPoolEvents(_poolEvents)
    setIsOpen(_poolInfo.poolState === PoolState.OPEN)
    setIsLocked(_poolInfo.poolState === PoolState.LOCKED)
    setIsUnlocked(_poolInfo.poolState === PoolState.UNLOCKED)
    setIsComplete(_poolInfo.poolState === PoolState.COMPLETE)

    setIsWinner(_poolInfo.winner.toLowerCase() === accounts[0].toLowerCase())
    setBalance(_winnings - _entry.withdrawn)
    setDeposited(_entry.amount)
    setWithdrawn(_entry.withdrawn)
    setWinnings(_winnings)
    setAllowance(_allowance)
    setEntry(_entry)
  }

  const connect = () => tokenContract.approve(pool, accounts[0], update)

  const decreaseAllowance = () => tokenContract.decreaseAllowance(pool, accounts[0], update)

  const buy = async () => {
    if (!poolContract || allowance <= 0) return
    poolContract.buyTickets(numTixToBuy, accounts[0], (confirmationNumber: number) => {
      if (confirmationNumber === 1) setNumTixToBuy(1)
      update(confirmationNumber)
    })
  }

  const withdraw = () => poolContract && deposited > 0 && poolContract.withdraw(accounts[0], update)

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

          {entry && (
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
                        <td>{accounts[0]}</td>
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
                        <td>{fromWei(deposited.toString())} DAI</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Winnings:</strong>
                        </td>
                        <td>{fromWei(String(winnings - deposited))} DAI</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Withdrawn:</strong>
                        </td>
                        <td>{fromWei(withdrawn.toString())} DAI</td>
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
                          {fromWei(String(winnings - deposited))} DAI
                        </strong>
                      </p>
                    </div>
                  )}
                  {isComplete && isWinner && balance === 0 && (
                    <p>Your winnings have been withdrawn. Thanks for playing!</p>
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
                        {!isComplete && (
                          <button onClick={decreaseAllowance}>Decrease Allowance</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <hr />
            </div>
          )}

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
                          showWinner && value === '0x0000000000000000000000000000000000000000'
                            ? 'TBA'
                            : value
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
            <hr />
            <Purchases purchases={poolEvents ? poolEvents[PoolEvent.BOUGHT_TICKETS] : []} />
            <hr />
            <Withdrawals withdrawals={poolEvents ? poolEvents[PoolEvent.WITHDRAWN] : []} />
            <hr />
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
      ) : loading}
    </div>
  )
}

export default App
