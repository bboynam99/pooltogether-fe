import React from 'react'

interface NoDiceProps {
  balance: number
}

export const NoDice: React.FC<NoDiceProps> = ({ balance }: NoDiceProps) => {
  return (
    <div style={{ textAlign: 'right' }}>
      <h1>No dice :(</h1>
      <p>Thanks for playing, and better luck next time!</p>
      {balance === 0 && <p>Your deposit has been withdrawn.</p>}
    </div>
  )
}
