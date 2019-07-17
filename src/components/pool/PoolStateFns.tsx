import React from 'react'
import { OnConfirmationHandler } from '../../contracts/contract.model'
import { PoolInstance } from '../../contracts/pool/pool.model'

interface PoolStateProps {
  playerAddress: string
  pool: PoolInstance
  secret: string
  secretHash: string
  update: OnConfirmationHandler
}

export const PoolStateFns: React.FC<PoolStateProps> = ({
  playerAddress,
  pool,
  secret,
  secretHash,
  update,
}: PoolStateProps) => {
  const { isLocked, isOpen, isUnlocked } = pool.state
  const lock = () => pool.lock(playerAddress, secretHash, update)
  const unlock = () => pool.unlock(playerAddress, update)
  const complete = () => pool.complete(playerAddress, secret, update)
  return (
    <div>
      {isOpen && <button onClick={lock}>Lock</button>}
      {isLocked && <button onClick={unlock}>Unlock</button>}
      {isUnlocked && <button onClick={complete}>Complete</button>}
    </div>
  )
}
