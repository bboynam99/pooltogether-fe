import React from 'react'
import { OnConfirmationHandler } from '../../contracts/contract.model'
import { PoolInstance } from '../../contracts/pool/pool.model'

interface WithdrawButtonProps {
  address: string
  onConfirmation: OnConfirmationHandler
  pool: PoolInstance
}

export const WithdrawButton: React.FC<WithdrawButtonProps> = ({
  address,
  onConfirmation,
  pool,
}) => {
  return (
    <button
      onClick={() => {
        pool.withdraw(address, onConfirmation)
      }}
    >
      Withdraw
    </button>
  )
}
