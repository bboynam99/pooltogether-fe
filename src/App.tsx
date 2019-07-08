import Web3 from 'web3';
import React, { ChangeEvent, useEffect, useState } from 'react'
import { get, pick, startCase } from 'lodash'
import './App.css';
import PoolManagerContract from './contracts/PoolManager.json'
import PoolContract from './contracts/Pool.json'
import TokenContract from './contracts/Token.json'

interface Window {
  ethereum?: any
  web3?: any
}

declare var window: Window

enum PoolState {
  OPEN,
  LOCKED,
  UNLOCKED,
  COMPLETE
}

interface PoolInfo {
  entryTotal: number
  startBlock: number
  endBlock: number
  poolState: PoolState
  winner: string
  supplyBalanceTotal: number
  ticketCost: number
  participantCount: number
  maxPoolSize: number
  estimatedInterestFixedPoint18: number
  hashOfSecret: string
}

// use the given Provider, e.g in the browser with Metamask, or instantiate a new websocket provider
let provider = 'ws://localhost:8545'
if (typeof window.ethereum !== 'undefined'
  || (typeof window.web3 !== 'undefined')) {

  // Web3 browser user detected. You can now use the provider.
  provider = window['ethereum'] || window.web3.currentProvider
}
const web3 = new Web3(provider, undefined, {})
const pmAbi: any = PoolManagerContract.abi
const pAbi: any = PoolContract.abi
const tAbi: any = TokenContract.abi
const poolManagerAddress = '0xBBF4ddd810690408398c47233D9c1844d8f8D4D6'
const tokenAddress = '0x3EF2b228Afb8eAf55c818ee916110D106918bC09'
const poolManager = new web3.eth.Contract(pmAbi, poolManagerAddress)
const tokenContract = new web3.eth.Contract(tAbi, tokenAddress)

const convertToDai = (val: string): number => Number(val) / 1000000000000000000

const App: React.FC = () => {
  const [ isOwner, setIsOwner ] = useState(false)
  const [ allowance, setAllowance ] = useState(0)
  const [ entry, setEntry ] = useState()
  const [ winnings, setWinnings ] = useState()
  const [ numTixToBuy, setNumTixToBuy ] = useState(1)
  const [ accounts, setAccounts ] = useState()
  const [ poolContract, setPoolContract ] = useState()
  const [ lockDuration, setLockDuration] = useState(0)
  const [ openDuration, setOpenDuration] = useState(0)
  const [ pool, setPool] = useState()
  const [ poolInfo, setPoolInfo] = useState<PoolInfo>()

  const [ showPmc, setShowPmc] = useState(true)
  const [ showPc, setShowPc] = useState()



  const init = async () => {
    if (!accounts || !accounts.length) return
    const res = await poolManager.methods.getInfo().call()
    const _poolContract = new web3.eth.Contract(pAbi, res._currentPool)
    const _isOwner = await _poolContract.methods.isOwner().call()
    const entry = await _poolContract.methods.getEntry(accounts[0]).call()
    const allowance = await tokenContract.methods.allowance(accounts[0], res._currentPool).call()
    const _winnings = await _poolContract.methods.winnings(accounts[0]).call()
    const info = pick(await _poolContract.methods.getInfo().call(), [
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
    setIsOwner(_isOwner)
    setWinnings(_winnings - entry.amount)
    setPoolContract(_poolContract)
    setAllowance(convertToDai(allowance.toString()))
    setLockDuration(res._lockDurationInBlocks.toString())
    setOpenDuration(res._openDurationInBlocks.toString())
    setPool(res._currentPool)
    setEntry(entry)
    setPoolInfo(info)
  }

  useEffect(() => {
    window.ethereum.enable().then(setAccounts)
    window.ethereum.on('accountsChanged', setAccounts)
  }, [])

  useEffect(() => {
    init()
  }, [accounts])

  const connect = () => tokenContract.methods.approve(pool, web3.utils.toWei('2000', 'ether')).send({
    from: accounts[0]
  }).on('confirmation', init)

  const decreaseAllowance = () => tokenContract.methods.decreaseAllowance(pool, web3.utils.toWei('2000', 'ether')).send({
    from: accounts[0]
  }).on('confirmation', init)

  const buy = async () => {
    if (!poolInfo) return
    try {
      const allowance = await tokenContract.methods.allowance(accounts[0], pool).call()
      if (allowance <= 0) return
      await poolContract.methods.buyTickets(numTixToBuy).send({
        from: accounts[0],
      }).on('confirmation', () => {
        setNumTixToBuy(1)
        init()
      })
    } catch (e) {
      console.error(e)
    }
  }

  const withdraw = async () => {
    if (!poolInfo) return
    try {
      const deposited = convertToDai(String(entry.amount))
      if (deposited <= 0) return
      await poolContract.methods.withdraw().send({
        from: accounts[0],
        value: 0
      }).on('confirmation', init)
    } catch (e) {
      console.error(e)
    }
  }

  const lock = async () => {
    if (!poolInfo || !isOwner) return
    try {
      await poolContract.methods.lock(poolInfo.hashOfSecret).send({
        from: accounts[0]
      })
    } catch (e) {
      console.error(e)
    }
  }

  const pmcMethods = PoolManagerContract.userdoc.methods
  const pcMethods = PoolContract.userdoc.methods
  
  return (
    <div className="App">
      {poolInfo ? (<div>
        <div className="grid-container">

          <div className="header">
            <h1>Pooltogether Test Interface</h1>
          </div>

          <div className="menu cell">
            <h4 style={{cursor: 'pointer', color: showPmc ? 'red' : ''}} onClick={() => {
              setShowPc(false)
              setShowPmc(!showPmc)
            }}>Pool Manager Contract Methods</h4>
            <h4 style={{cursor: 'pointer', color: showPc ? 'red' : ''}} onClick={() => {
              setShowPmc(false)
              setShowPc(!showPc)
            }}>Pool Contract Methods</h4>
          </div>

          {entry && (<div className="entry cell">
            <h2>Your Pooltogether</h2>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <table>
                <tbody>
                <tr>
                  <td><strong>Address:</strong></td>
                  <td>{accounts[0]}</td>
                </tr>
                <tr>
                  <td><strong>Deposited:</strong></td>
                  <td>{convertToDai(String(entry.amount))} DAI</td>
                </tr>
                <tr>
                  <td><strong>Tickets:</strong></td>
                  <td>{entry.ticketCount.toNumber()}</td>
                </tr>
                <tr>
                  <td><strong>Winnings:</strong></td>
                  <td>{convertToDai(winnings)} DAI</td>
                </tr>
                <tr>
                  <td><strong>Withdrawn:</strong></td>
                  <td>{convertToDai(String(entry.withdrawn))} DAI</td>
                </tr>
                </tbody>
              </table>
              <div>
                <div><strong>Allowance:</strong> {allowance} DAI</div>
                {allowance <= 0 ? (<button onClick={connect}>Connect to Pool</button>) : (<div>
                  <input type="number" min={1} value={numTixToBuy} onChange={(evt: ChangeEvent<HTMLInputElement>) => setNumTixToBuy(Number(evt.target.value))}/>
                  <div className="actions">

                    <button disabled={allowance <= 0} onClick={buy}>Buy {numTixToBuy === 1 ? 'a' : numTixToBuy} Ticket{numTixToBuy > 1 && 's'}</button>
                    <button disabled={convertToDai(String(entry.amount)) <= 0 || poolInfo.poolState !==2} onClick={withdraw}>Withdraw</button>
                    <button disabled={allowance < 2000} onClick={decreaseAllowance}>Decrease Allowance</button>
                  </div>
                </div>)}

              </div>
            </div>
            <hr/>
          </div>)}

          <div className="poolInfo cell">
            <h2>Current Pool Info</h2>
            <h4>Address: {pool}</h4>
            <div className="pool-grid-container">
              {pool && (<div className="pool-info-1">
                <table>
                  <tbody>
                  <tr>
                    <td><strong>State:</strong></td>
                    <td>
                      <div>{PoolState[poolInfo.poolState]}</div>
                      {poolInfo.poolState === 0 && isOwner && <button onClick={lock}>Lock Pool</button>}

                    </td>
                  </tr>
                  <tr>
                    <td><strong>Total Pool Capital:</strong></td>
                    <td>{convertToDai(poolInfo.entryTotal.toString())} DAI</td>
                  </tr>
                  <tr>
                    <td><strong>Lock Duration:</strong></td>
                    <td>{lockDuration} blocks</td>
                  </tr>
                  <tr>
                    <td><strong>Open Duration:</strong></td>
                    <td>{openDuration} blocks</td>
                  </tr>
                  </tbody>
                </table>
              </div>)}
              <div className="pool-info-2">
                <table>
                  <tbody>
                  {['ticketCost', 'supplyBalanceTotal', 'maxPoolSize', 'startBlock', 'endBlock'].map((name: string) => {
                    const value = get(poolInfo, name).toString()
                    const convert = ['ticketCost', 'maxPoolSize', 'supplyBalanceTotal'].includes(name)
                    const showWinner = name === 'winner'
                    const winner = showWinner && value === '0x0000000000000000000000000000000000000000' ? 'TBA' : value
                    name = name === 'estimatedInterestFixedPoint18' ? 'estimatedInterest' : name
                    return (<tr key={name.toString()}>
                      <td><strong>{startCase(name)}:</strong></td>
                      <td>{showWinner ? winner : convert ? `${convertToDai(value)} DAI` : value}</td>
                    </tr>)
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
                      <td>{showWinner ? winner : convert ? `${convertToDai(value)} DAI` : value}</td>
                    </tr>)
                  })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="fns cell">
            <hr/>
            <ul style={{display: showPmc ? 'block' : 'none' }}>
              <h3>Pool Manager Contract Methods</h3>
              {Object.keys(PoolManagerContract.userdoc.methods).map((name: string) => (<li key={name}>
                <strong>{name}</strong><br/>
                <p style={{marginLeft: 20}}>{get(pmcMethods, name).notice}</p>
              </li>))}
            </ul>
            <ul style={{display: showPc ? 'block' : 'none' }}>
              <h3>Pool Contract Methods</h3>
              {Object.keys(PoolContract.userdoc.methods).map((name: string) => (<li key={name}>
                <strong>{name}</strong><br/>
                <p style={{marginLeft: 20}}>{get(pcMethods, name).notice}</p>
              </li>))}
            </ul>
          </div>
        </div>
      </div>): <div style={{margin: 20}}>Loading...</div>}
    </div>
  )
}

export default App
