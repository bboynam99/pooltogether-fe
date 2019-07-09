import Web3 from 'web3';
import React, { ChangeEvent, useEffect, useState } from 'react'
import { get, pick, startCase } from 'lodash'
import './App.css';
import PoolManagerContract from './contracts/PoolManager.json'
import PoolContract from './contracts/Pool.json'
import TokenContract from './contracts/Token.json'
import { Contract } from 'web3-eth-contract'

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
const secret: any = web3.utils.asciiToHex('test_pool')
const secretEncoded: any = web3.eth.abi.encodeParameter('bytes32', secret)
const secretHash: any = web3.utils.soliditySha3(secretEncoded)

const asDai = (val: string): number => Number(web3.utils.fromWei(val))

interface ContractData {
  _isOwner: boolean
  _poolContract: Contract
  _winnings: number
  _balance: number
  _allowance: number
  _entry: any
  _lockDuration: number
  _openDuration: number
  _pool: string
  _poolInfo: PoolInfo
}

const getContractData = async (accounts: string[]): Promise<ContractData> => {
  const res = await poolManager.methods.getInfo().call()
  const _poolContract = new web3.eth.Contract(pAbi, res._currentPool)
  const _isOwner = await _poolContract.methods.isOwner().call({from: accounts[0]})
  const _entry = await _poolContract.methods.getEntry(accounts[0]).call()
  const allowance = await tokenContract.methods.allowance(accounts[0], res._currentPool).call()
  const _balance = await tokenContract.methods.balanceOf(accounts[0]).call()
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
  return {
    _isOwner,
    _balance,
    _winnings,
    _poolContract,
    _allowance: asDai(allowance.toString()),
    _lockDuration: res._lockDurationInBlocks.toString(),
    _openDuration: res._openDurationInBlocks.toString(),
    _pool: res._currentPool,
    _entry,
    _poolInfo: info,
  }
}

const App: React.FC = () => {
  const [ isOwner, setIsOwner ] = useState(false)
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

  const [ showPmc, setShowPmc] = useState()
  const [ showPc, setShowPc] = useState()

  useEffect(() => {
    const accountsChangeHandler = async (_accounts: string[]) => {
      const { _isOwner, _poolContract, _winnings, _allowance, _entry, _lockDuration, _openDuration, _pool, _poolInfo} = await getContractData(_accounts)
      setAccounts(_accounts)
      setIsWinner(_poolInfo.winner.toLowerCase() === _accounts[0].toLowerCase())
      setBalance(_winnings - _entry.withdrawn)
      setDeposited(_entry.amount)
      setWithdrawn(_entry.withdrawn)
      setIsOwner(_isOwner)
      setWinnings(_winnings)
      setPoolContract(_poolContract)
      setAllowance(_allowance)
      setLockDuration(_lockDuration)
      setOpenDuration(_openDuration)
      setPool(_pool)
      setEntry(_entry)
      setPoolInfo(_poolInfo)
    }
    window.ethereum.enable().then(accountsChangeHandler)
    window.ethereum.on('accountsChanged', accountsChangeHandler)
    return () => window.ethereum.off('accountsChanged', accountsChangeHandler)
  }, [])

  const update = async (confirmationNum: number = 1) => {
    if (confirmationNum > 1) return
    const { _allowance, _entry, _isOwner, _poolInfo, _winnings} = await getContractData(accounts)
    setIsOwner(_isOwner)
    setIsWinner(_poolInfo.winner.toLowerCase() === accounts[0].toLowerCase())
    setDeposited(_entry.amount)
    setWinnings(_winnings)
    setWithdrawn(_entry.withdrawn)
    setBalance(_winnings - _entry.withdrawn)
    setAllowance(_allowance)
    setEntry(_entry)
    setPoolInfo(_poolInfo)
  }

  const connect = () => tokenContract.methods.approve(pool, web3.utils.toWei('2000', 'ether')).send({
    from: accounts[0]
  }).on('confirmation', update)

  const decreaseAllowance = () => tokenContract.methods.decreaseAllowance(pool, web3.utils.toWei('20', 'ether'))
    .send({
      from: accounts[0]
    })
    .on('confirmation', update)

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
      const deposited = asDai(String(entry.amount))
      if (deposited <= 0) return
      await poolContract.methods.withdraw().send({
        from: accounts[0],
        value: 0
      }).on('confirmation', update)
    } catch (e) {
      console.error(e)
    }
  }

  const lock = async () => {
    if (!poolInfo || !isOwner) return
    poolContract.methods.lock(secretHash).send({
      from: accounts[0]
    }).on('confirmation', update)
  }

  const unlock = () => {
    if (!poolInfo || !isOwner) return
    poolContract.methods.unlock().send({
      from: accounts[0]
    }).on('confirmation', update)
  }

  const complete = async () => {
    if (!isOwner) return
    await poolContract.methods.complete(secret).send({
      from: accounts[0]
    }).on('confirmation', update)
  }

  const pmcMethods = PoolManagerContract.userdoc.methods
  const pcMethods = PoolContract.userdoc.methods
  const isComplete = poolInfo && poolInfo.poolState === 3
  const isOpen = poolInfo && poolInfo.poolState === 0
  // const isWinner = poolInfo && poolInfo.winner === accounts[0]

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
            <h2>Current Pool Info</h2>
            <h4>Address: {pool}</h4>
            <div className="pool-grid-container">
              {pool && (<div className="pool-info-1">
                <table>
                  <tbody>
                  <tr>
                    <td><strong>State:</strong></td>
                    <td>
                      {PoolState[poolInfo.poolState]}
                      {poolInfo.poolState === 0 && isOwner && <button style={{marginLeft: 10}} onClick={lock}>Lock</button>}
                      {poolInfo.poolState === 1 && isOwner && <button style={{marginLeft: 10}} onClick={unlock}>Unlock</button>}
                      {poolInfo.poolState === 2 && isOwner && <button style={{marginLeft: 10}} onClick={complete}>Complete</button>}
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Total Pool Capital:</strong></td>
                    <td>{asDai(poolInfo.entryTotal.toString())} DAI</td>
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
                      <td>{showWinner ? winner : convert ? `${asDai(value)} DAI` : value}</td>
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
                {Object.keys(PoolManagerContract.userdoc.methods).map((name: string) => (<li key={name}>
                  <strong>{name}</strong><br/>
                  <p style={{marginLeft: 20}}>{get(pmcMethods, name).notice}</p>
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
