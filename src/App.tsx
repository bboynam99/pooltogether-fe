
import React, { ChangeEvent, useEffect, useState } from 'react'
import { get, pick, startCase } from 'lodash'
import './App.css';
import PoolContract from './contracts/Pool.json'
import TokenContract from './contracts/Token.json'
import { Contract } from 'web3-eth-contract'
import { PoolManager } from './poolManager/PoolManager'
import PoolManagerContract, { PoolManagerInstance } from './poolManager/PoolManagerContract'
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



const asDai = (val: string): number => Number(fromWei(val))

interface ContractData {
  _manager: PoolManagerInstance
  _isPoolManager: boolean
  _isPoolOwner: boolean
  _poolContract: Contract
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
  const manager = PoolManagerContract(accounts[0])
  const _poolManagerInfo = await manager.getInfo()
  const _poolContract = getContract(pAbi, _poolManagerInfo._currentPool)
  const _isPoolManager = await manager.isManager(accounts[0])

  const _entry = await _poolContract.methods.getEntry(accounts[0]).call()
  const allowance = await tokenContract.methods.allowance(accounts[0], _poolManagerInfo._currentPool).call()
  const _balance = await tokenContract.methods.balanceOf(accounts[0]).call()
  const _winnings = await _poolContract.methods.winnings(accounts[0]).call()
  const _poolInfo = pick(await _poolContract.methods.getInfo().call(), [
    'entryTotal',
    'startBlock',
    'endBlock',
    'poolState',
    'winner',
    'supplyBalanceTotal',
    'ticketCost',
    'participantCount',
    'maxPoolSize',
    'estimatedInterestFixedPoint18',
    'hashOfSecret',
  ])
  return {
    _manager: manager,
    _isPoolManager,
    _isPoolOwner,
    _balance,
    _winnings,
    _poolContract,
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
  const [ manager, setManager ] = useState<PoolManagerInstance>()
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
  const [ poolContract, setPoolContract ] = useState()
  const [ lockDuration, setLockDuration] = useState(0)
  const [ openDuration, setOpenDuration] = useState(0)
  const [ pool, setPool] = useState()
  const [ poolInfo, setPoolInfo] = useState<PoolInfo>()
  const [ poolManagerInfo, setPoolManagerInfo] = useState<any>()

  const [ showPmc, setShowPmc] = useState()
  const [ showPc, setShowPc] = useState()

  useEffect(() => {
    const accountsChangeHandler = async (_accounts: string[]) => {
      const { _isPoolManager, _isPoolOwner, _manager, _poolContract, _winnings, _allowance, _entry, _lockDuration, _openDuration, _pool, _poolInfo, _poolManagerInfo} = await getContractData(_accounts)
      setAccounts(_accounts)
      setManager(_manager)
      setIsPoolManager(_isPoolManager)
      setIsPoolOwner(_isPoolOwner)
      setPoolInfo(_poolInfo)
      setPoolManagerInfo(_poolManagerInfo)
      setIsWinner(_poolInfo.winner.toLowerCase() === _accounts[0].toLowerCase())
      setBalance(_winnings - _entry.withdrawn)
      setDeposited(_entry.amount)
      setWithdrawn(_entry.withdrawn)
      setWinnings(_winnings)
      setPoolContract(_poolContract)
      setAllowance(_allowance)
      setLockDuration(_lockDuration)
      setOpenDuration(_openDuration)
      setPool(_pool)
      setEntry(_entry)
    }
    enable().then(accountsChangeHandler)
    onAccountsChanged(accountsChangeHandler)
    return () => removeAccountsChanged(accountsChangeHandler)
  }, [])

  const update = async (confirmationNum: number = 1) => {
    if (confirmationNum > 1) return
    const { _allowance, _entry, _isPoolManager, _isPoolOwner, _manager, _poolInfo, _poolManagerInfo, _winnings} = await getContractData(accounts)
    setManager(_manager)
    setIsPoolManager(_isPoolManager)
    setIsPoolOwner(_isPoolOwner)
    setPoolManagerInfo(_poolManagerInfo)
    setPoolInfo(_poolInfo)
    setIsWinner(_poolInfo.winner.toLowerCase() === accounts[0].toLowerCase())
    setDeposited(_entry.amount)
    setWinnings(_winnings)
    setWithdrawn(_entry.withdrawn)
    setBalance(_winnings - _entry.withdrawn)
    setAllowance(_allowance)
    setEntry(_entry)
  }

  const buy = async () => {
    if (!poolInfo) return
    try {
      const allowance = await tokenContract.methods.allowance(accounts[0], pool).call()
      if (allowance <= 0) return
      poolContract.methods.buyTickets(numTixToBuy)
        .send({
        from: accounts[0],
      })
        .on('confirmation', (confirmationNumber: number) => {
          if (confirmationNumber === 1) setNumTixToBuy(1)
          update(confirmationNumber)
        })
    } catch (e) {
      console.error(e)
    }
  }

  const withdraw = async () => {
    if (!poolInfo) return
    try {
      if (deposited <= 0) return
      await poolContract.methods.withdraw().send({
        from: accounts[0],
        value: 0
      }).on('confirmation', update)
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * Pool Manager Methods
   */



  /**
   * Pool Methods
   */
  }

  if (!manager) return null

  ////////////////////////////////////////////////////////////////////////////////////////

  const pcMethods = PoolContract.userdoc.methods
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
                {Object.keys(manager.methods).map((name: string) => (<li key={name}>
                  <strong>{name}</strong><br/>
                  <p style={{marginLeft: 20}}>{get(manager.methods, name).notice}</p>
                </li>))}
              </ul>
            </div>
            <div style={{display: showPc ? 'block' : 'none'}}>
              <h2>Pool Contract Methods</h2>
              <ul style={{padding: 0}}>
                {Object.keys(PoolContract.userdoc.methods).map((name: string) => (<li key={name}>
                  <strong>{name}</strong><br/>
                  <p style={{marginLeft: 20}}>{get(pcMethods, name).notice}</p>
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
