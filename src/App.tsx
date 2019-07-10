
import React, { ChangeEvent, useEffect, useState } from 'react'
import { get, pick, startCase } from 'lodash'
import './App.css';
import { Contract } from 'web3-eth-contract'
import PoolContract, { PoolInfo, PoolInstance, PoolState } from './pool/PoolContract'
import { PoolManager } from './poolManager/PoolManager'
import PoolManagerContract, { PoolManagerInstance } from './poolManager/PoolManagerContract'
import TokenContract, { TokenInstance } from './token/TokenContract'
import {
  abiEncodeSecret,
  asciiToHex,
  enable,
  fromWei,
  getContract,
  onAccountsChanged,
  removeAccountsChanged,
  soliditySha3, toWei
} from './web3'

const contractOwner = {
  address: '0x8f7f92e0660dd92eca1fad5f285c4dca556e433e',
  privateKey: '0xab7873cc1c85a753f5e23eb3c7fc6c3c5b475304501a41855b4a437b38bf1396'
}

const secret: any = asciiToHex('test_pool')
const secretHash: string = soliditySha3(abiEncodeSecret(secret))

const asDai = (val: string): number => Number(fromWei(val))

interface ContractData {
  _isPoolManager: boolean
  _isPoolOwner: boolean
  _poolContract: PoolInstance
  _poolManagerContract: PoolManagerInstance
  _tokenContract: TokenInstance
  _winnings: number
  _balance: number
  _allowance: number
  _entry: any
  _lockDuration: number
  _openDuration: number
  _pool: string
  _poolManagerInfo: any
  _poolInfo: PoolInfo
}

const getContractData = async (accounts: string[]): Promise<ContractData> => {
  const _account = accounts.length ? accounts[0] : ''

  // Pool Manager
  const _poolManagerContract = PoolManagerContract(contractOwner.address)
  const _poolManagerInfo = await _poolManagerContract.getInfo()
  const _isPoolManager = await _poolManagerContract.isManager(_account)

  // Current Pool
  const _poolContract = PoolContract(contractOwner.address)
  const _poolInfo = await _poolContract.getInfo()
  const _isPoolOwner = await _poolContract.isOwner(_account)
  const _entry = await _poolContract.getEntry(_account)
  const _winnings = await _poolContract.winnings(_account)

  // Token
  const _tokenContract = TokenContract()
  const allowance = await _tokenContract.allowance(_account, _poolManagerInfo._currentPool)
  const _balance = await _tokenContract.balanceOf(_account)

  return {
    _poolContract,
    _poolManagerContract,
    _tokenContract,
    _isPoolManager,
    _isPoolOwner,
    _balance,
    _winnings,
    _allowance: asDai(allowance.toString()),
    _lockDuration: _poolManagerInfo._lockDurationInBlocks.toString(),
    _openDuration: _poolManagerInfo._openDurationInBlocks.toString(),
    _pool: _poolManagerInfo._currentPool,
    _entry,
    _poolManagerInfo,
    _poolInfo,
  }
}

const App: React.FC = () => {
  // contracts
  const [ poolContract, setPoolContract ] = useState<PoolInstance>()
  const [ poolManagerContract, setPoolManagerContract ] = useState<PoolManagerInstance>()
  const [ tokenContract, setTokenContract ] = useState<TokenInstance>()

  const [ isPoolManager, setIsPoolManager ] = useState(false)
  const [ isPoolOwner, setIsPoolOwner ] = useState(false)
  const [ isWinner, setIsWinner ] = useState(false)
  const [ balance, setBalance ] = useState()
  const [ allowance, setAllowance ] = useState()
  const [ deposited, setDeposited ] = useState()
  const [ withdrawn, setWithdrawn ] = useState()
  const [ entry, setEntry ] = useState()
  const [ winnings, setWinnings ] = useState()
  const [ numTixToBuy, setNumTixToBuy ] = useState(1)
  const [ accounts, setAccounts ] = useState()
  const [ lockDuration, setLockDuration] = useState(0)
  const [ openDuration, setOpenDuration] = useState(0)
  const [ pool, setPool] = useState()
  const [ poolInfo, setPoolInfo] = useState<PoolInfo>()
  const [ poolManagerInfo, setPoolManagerInfo] = useState<any>()

  const [ showPmc, setShowPmc] = useState()
  const [ showPc, setShowPc] = useState()

  useEffect(() => {
    const accountsChangeHandler = async (_accounts: string[]) => {
      const { _isPoolManager, _isPoolOwner, _poolManagerContract, _poolContract, _tokenContract, _winnings, _allowance, _entry, _lockDuration, _openDuration, _pool, _poolInfo, _poolManagerInfo} = await getContractData(_accounts)
      setAccounts(_accounts)

      setPoolManagerContract(_poolManagerContract)
      setPoolContract(_poolContract)
      setTokenContract(_tokenContract)

      setIsPoolManager(_isPoolManager)
      setIsPoolOwner(_isPoolOwner)
      setPoolManagerInfo(_poolManagerInfo)

      setPool(_pool)
      setPoolInfo(_poolInfo)

      setIsWinner(_poolInfo.winner.toLowerCase() === _accounts[0].toLowerCase())
      setBalance(_winnings - _entry.withdrawn)
      setDeposited(_entry.amount)
      setWithdrawn(_entry.withdrawn)
      setWinnings(_winnings)
      setAllowance(_allowance)
      setLockDuration(_lockDuration)
      setOpenDuration(_openDuration)
      setEntry(_entry)
    }
    enable().then(accountsChangeHandler)
    onAccountsChanged(accountsChangeHandler)
    return () => removeAccountsChanged(accountsChangeHandler)
  }, [])

  const update = async (confirmationNum: number = 1) => {
    if (confirmationNum > 1) return
    const { _allowance, _entry, _isPoolManager, _isPoolOwner, _poolContract, _poolManagerContract, _poolInfo, _poolManagerInfo, _tokenContract, _winnings} = await getContractData(accounts)
    setPoolManagerContract(_poolManagerContract)
    setPoolContract(_poolContract)
    setTokenContract(_tokenContract)

    setIsPoolManager(_isPoolManager)
    setPoolManagerInfo(_poolManagerInfo)

    setIsPoolOwner(_isPoolOwner)
    setPoolInfo(_poolInfo)

    setIsWinner(_poolInfo.winner.toLowerCase() === accounts[0].toLowerCase())
    setDeposited(_entry.amount)
    setWinnings(_winnings)
    setWithdrawn(_entry.withdrawn)
    setBalance(_winnings - _entry.withdrawn)
    setAllowance(_allowance)
    setEntry(_entry)
  }

  if (!poolManagerContract || !poolContract || !tokenContract) return null

  const connect = () => tokenContract.approve(accounts[0], pool, update)

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

  const complete = () => poolInfo && isPoolOwner && poolContract.complete(accounts[0], secret, update)

  const methodDescription = (value: {notice: string} | string) => typeof value === 'string' ? value : value.notice

  ////////////////////////////////////////////////////////////////////////////////////////

  const pcMethods = poolContract.methodDocs
  const isComplete = poolInfo && poolInfo.poolState === 3
  const isOpen = poolInfo && poolInfo.poolState === 0

  return (
    <div className="App">
      {poolInfo ? (<div>
        <div className="grid-container">

          <div className="header">
            <h1>Pooltogether Test Interface</h1>
          </div>

          <div className="menu cell">
            <h4 style={{cursor: 'pointer', color: showPc ? 'red' : ''}} onClick={() => {
              setShowPmc(false)
              setShowPc(!showPc)
            }}>Pool Contract Methods</h4>
            <h4 style={{cursor: 'pointer', color: showPmc ? 'red' : ''}} onClick={() => {
              setShowPc(false)
              setShowPmc(!showPmc)
            }}>Pool Manager Contract Methods</h4>
            <hr/>
            {isPoolManager && <PoolManager accounts={accounts[0]} currentPoolComplete={!!isComplete} onConfirmation={update} poolManagerInfo={poolManagerInfo}/>}

            <h4>Previous Pools</h4>
          </div>

          {entry && (<div className="entry cell">
            <h2>Your Pooltogether</h2>

            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <table>
                  <tbody>
                  <tr>
                    <td><strong>Address:</strong></td>
                    <td>{accounts[0]}</td>
                  </tr>
                  <tr>
                    <td><strong>Tickets:</strong></td>
                    <td>{entry.ticketCount.toNumber()}</td>
                  </tr>
                  <tr>
                    <td><strong>Deposit:</strong></td>
                    <td>{asDai(deposited.toString())} DAI</td>
                  </tr>
                  <tr>
                    <td><strong>Winnings:</strong></td>
                    <td>{asDai(String(winnings - deposited))} DAI</td>
                  </tr>
                  <tr>
                    <td><strong>Withdrawn:</strong></td>
                    <td>{asDai(withdrawn.toString())} DAI</td>
                  </tr>
                  <tr>
                    <td><strong>Balance:</strong></td>
                    <td>{asDai(String(balance))} DAI</td>
                  </tr>
                  </tbody>
                </table>
              </div>
              <div style={{minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between'}}>
                {isWinner && <div>
                  <h1 style={{textAlign: 'right'}}>Winner, winner, chicken dinner!</h1>
                  <p style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
                    <span>You won</span>
                    <strong style={{fontSize: 38, marginLeft: 10}}>{asDai(String(winnings - deposited))} DAI</strong>
                  </p>
                </div>}
                {isComplete && isWinner && balance === 0 && <p>Your winnings have been withdrawn. Thanks for playing!</p>}
                {!isComplete && <div><strong>Allowance:</strong> {allowance} DAI</div>}
                {allowance <= 0 && !isComplete ? (<button onClick={connect}>Connect to Pool</button>) : (<div>
                  {!isComplete && <input type="number" min={1} value={numTixToBuy} onChange={(evt: ChangeEvent<HTMLInputElement>) => setNumTixToBuy(Number(evt.target.value))}/>}
                  <div className="actions">
                    {isComplete && balance > 0 && <button onClick={withdraw}>Withdraw</button>}
                    {isOpen && allowance > 0 && <button onClick={buy}>Buy {numTixToBuy === 1 ? 'a' : numTixToBuy} Ticket{numTixToBuy > 1 && 's'}</button>}
                    {!isComplete && <button onClick={decreaseAllowance}>Decrease Allowance</button>}
                  </div>
                </div>)}
              </div>
            </div>
            <hr/>
          </div>)}

          <div className="poolInfo cell">
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <h2 style={{marginTop: 0, marginBottom: 0}}>Current Pool Info</h2>
              <span><strong>Total Pool Capital:</strong> {asDai(poolInfo.entryTotal.toString())} DAI</span>
            </div>
            <h4>Address: {pool}</h4>
            <div className="pool-grid-container">
              {pool && (<table className="pool-info-1">
                  <tbody>
                  <tr>
                    <td style={{width: 50}}><strong>State:</strong></td>
                    <td>
                      <span style={{fontSize: 50}}>{PoolState[poolInfo.poolState]}</span>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2}>
                      {poolInfo.poolState === 0 && isPoolOwner && <button style={{width: '100%'}} onClick={lock}>Lock</button>}
                      {poolInfo.poolState === 1 && isPoolOwner && <button style={{width: '100%'}} onClick={unlock}>Unlock</button>}
                      {poolInfo.poolState === 2 && isPoolOwner && <button style={{width: '100%'}} onClick={complete}>Complete</button>}
                    </td>
                  </tr>
                  </tbody>
                </table>)}
              <div className="pool-info-2">
                <table>
                  <tbody>
                  {['ticketCost', 'supplyBalanceTotal', 'maxPoolSize', 'startBlock', 'endBlock'].map((name: string) => {
                    const value = get(poolInfo, name).toString()
                    const convert = ['ticketCost', 'maxPoolSize', 'supplyBalanceTotal'].includes(name)
                    const showWinner = name === 'winner'
                    const winner = showWinner && value === '0x0000000000000000000000000000000000000000' ? 'TBA' : value
                    name = name === 'estimatedInterestFixedPoint18' ? 'estimatedInterest' : name
                    const full = <tr key={name}>
                      <td><strong>{startCase(name)}:</strong></td>
                      <td>{showWinner ? winner : convert ? `${asDai(value)} DAI` : value}</td>
                    </tr>
                    if (['ticketCost', 'supplyBalanceTotal', 'maxPoolSize'].includes(name)) return
                    return (!['ticketCost', 'supplyBalanceTotal', 'maxPoolSize'].includes(name) && full)
                  })}
                  </tbody>
                </table>
              </div>
              <div className="pool-info-3">
                <table>
                  <tbody>
                  {['participantCount', 'estimatedInterestFixedPoint18', 'winner'].map((name: string) => {
                    const value = get(poolInfo, name).toString()
                    const convert = ['estimatedInterestFixedPoint18'].includes(name)
                    const showWinner = name === 'winner'
                    const winner = showWinner && value === '0x0000000000000000000000000000000000000000' ? 'TBA' : value
                    name = name === 'estimatedInterestFixedPoint18' ? 'estimatedInterest' : name
                    return (<tr key={name.toString()}>
                      <td><strong>{startCase(name)}:</strong></td>
                      <td>{showWinner ? winner : convert ? `${asDai(value)} DAI` : value}</td>
                    </tr>)
                  })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="fns cell">
            <hr/>
            <div style={{display: showPmc ? 'block' : 'none'}}>
              <h2>Pool Manager Contract Methods</h2>
              <ul style={{padding: 0}}>
                {Object.keys(poolManagerContract.methodDocs).map((name: string) => (<li key={name}>
                  <strong>{name}</strong><br/>
                  <p style={{marginLeft: 20}}>{methodDescription(poolManagerContract.methodDocs[name])}</p>
                </li>))}
              </ul>
            </div>
            <div style={{display: showPc ? 'block' : 'none'}}>
              <h2>Pool Contract Methods</h2>
              <ul style={{padding: 0}}>
                {Object.keys(poolContract.methodDocs).map((name: string) => (<li key={name}>
                  <strong>{name}</strong><br/>
                  <p style={{marginLeft: 20}}>{methodDescription(poolContract.methodDocs[name])}</p>
                </li>))}
              </ul>
            </div>
          </div>
        </div>
      </div>): <div style={{margin: 20}}>Loading...</div>}
    </div>
  )
}

export default App
