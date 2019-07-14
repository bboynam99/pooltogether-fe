import React from 'react'
import { OnConfirmationHandler } from '../contract.model'
import { PoolInstance } from './pool.model'

interface WithdrawButtonProps {
  address: string
  onConfirmation: OnConfirmationHandler
  pool: PoolInstance
}

export const WithdrawButton: React.FC<WithdrawButtonProps> = ({address, onConfirmation, pool}) => {
  return (
    <button onClick={() => {
      pool.withdraw(address, onConfirmation)
    }}>Withdraw</button>
  )
}
