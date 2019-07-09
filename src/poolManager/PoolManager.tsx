import React  from 'react'
import PoolManagerContract from './PoolManagerContract'

interface PoolManagerProps {
  accounts: string[]
  currentPoolComplete: boolean
  poolManagerInfo: any
  onConfirmation: () => void
}

export const PoolManager: React.FC<PoolManagerProps> = ({accounts, currentPoolComplete, onConfirmation, poolManagerInfo}: PoolManagerProps) => {

  const { createPool, isManager } = PoolManagerContract(accounts[0])

  return (isManager(accounts[0]) && poolManagerInfo ? <div>
    <h2>Pool Management</h2>
    <div style={{textAlign: 'center', marginTop: 10, marginBottom: 20}}><button disabled={!currentPoolComplete} onClick={() => createPool(onConfirmation)} style={{width: '100%'}}>Create Pool</button></div>

    <table>
      <caption style={{textAlign: 'left'}}><strong>Pool Creation Variables</strong></caption>
      <tbody>
      <tr>
        <td><strong>Lock Duration:</strong></td>
        <td>{poolManagerInfo._lockDurationInBlocks.toString()} blocks</td>
      </tr>
      <tr>
        <td><strong>Open Duration:</strong></td>
        <td>{poolManagerInfo._openDurationInBlocks.toString()} blocks</td>
      </tr>
      </tbody>
    </table>

    <hr/>
  </div> : null)
}
