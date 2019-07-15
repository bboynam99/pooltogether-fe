import React from 'react'
import { OnConfirmationHandler } from '../../contracts/contract.model'
import { PoolInstance, PoolState } from '../../contracts/pool/pool.model'

interface PoolStateProps {
  account: string
  isOwner: boolean
  pool: PoolInstance
  secret: string
  secretHash: string
  update: OnConfirmationHandler
}

export const PoolStateFns: React.FC<PoolStateProps> = ({
  account,
  pool,
  secret,
  secretHash,
  update,
}: PoolStateProps) => {
  const lock = () => pool.lock(account, secretHash, update)
  const unlock = () => pool.unlock(account, update)
  const complete = () => pool.complete(account, secret, update)
  return (
    <div>
      {pool.info.poolState === PoolState.OPEN && <button onClick={lock}>Lock</button>}
      {pool.info.poolState === PoolState.LOCKED && <button onClick={unlock}>Unlock</button>}
      {pool.info.poolState === PoolState.UNLOCKED && <button onClick={complete}>Complete</button>}
    </div>
  )
}
