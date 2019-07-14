import React from 'react'
import { OnConfirmationHandler } from '../contract.model'
import { PoolInstance, PoolState } from './pool.model'

interface PoolStateProps {
  account: string
  isOwner: boolean
  pool: PoolInstance
  secret: string
  secretHash: string
  update: OnConfirmationHandler
}

export const PoolStateTable: React.FC<PoolStateProps> = ({ account, isOwner, pool, secret, secretHash, update }: PoolStateProps) => {
  const lock = () => pool.lock(account, secretHash, update)
  const unlock = () => pool.unlock(account, update)
  const complete = () => pool.complete(account, secret, update)
  return (<table className="pool-info-1">
    <tbody>
    <tr>
      <td style={{ width: 50 }}>
        <strong>State:</strong>
      </td>
      <td>
        <span style={{ fontSize: 50 }}>{PoolState[pool.info.poolState]}</span>
      </td>
    </tr>
    {isOwner && (
      <tr>
        <td colSpan={2}>
          {pool.info.poolState === PoolState.OPEN && (
            <button style={{ width: '100%' }} onClick={lock}>
              Lock
            </button>
          )}
          {pool.info.poolState === PoolState.LOCKED && (
            <button style={{ width: '100%' }} onClick={unlock}>
              Unlock
            </button>
          )}
          {pool.info.poolState === PoolState.UNLOCKED && (
            <button style={{ width: '100%' }} onClick={complete}>
              Complete
            </button>
          )}
        </td>
      </tr>
    )}
    </tbody>
  </table>)
}
