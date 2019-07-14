import React from 'react'
import { OnConfirmationHandler } from '../contract.model'
import { PoolManagerInstance } from './poolManager.model'

interface PoolManagerProps {
  accounts: string[]
  poolManagerContract: PoolManagerInstance
  currentPoolComplete: boolean
  poolManagerInfo: any
  onConfirmation: OnConfirmationHandler
}

export const PoolManager: React.FC<PoolManagerProps> = ({
  accounts,
  poolManagerContract,
  currentPoolComplete,
  onConfirmation,
  poolManagerInfo,
}: PoolManagerProps) => {
  return (
    <div>
      <h2>Pool Management</h2>
      <div style={{ textAlign: 'center', marginTop: 10, marginBottom: 20 }}>
        <button
          disabled={!currentPoolComplete}
          onClick={() =>
            poolManagerContract.createPool(accounts[0], (confirmationNumber: number = 1) => {
              onConfirmation(confirmationNumber)
            })
          }
          style={{ width: '100%' }}
        >
          Create Pool
        </button>
      </div>

      <table>
        <caption style={{ textAlign: 'left' }}>
          <strong>Pool Creation Variables</strong>
        </caption>
        <tbody>
          <tr>
            <td>
              <strong>Lock Duration:</strong>
            </td>
            <td>{poolManagerInfo._lockDurationInBlocks.toString()} blocks</td>
          </tr>
          <tr>
            <td>
              <strong>Open Duration:</strong>
            </td>
            <td>{poolManagerInfo._openDurationInBlocks.toString()} blocks</td>
          </tr>
        </tbody>
      </table>

      <hr />
    </div>
  )
}
