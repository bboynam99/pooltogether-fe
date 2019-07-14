import React from 'react'
import { EtherscanLink } from '../../components/EtherscanLink'
import { OnConfirmationHandler } from '../contract.model'
import { PoolInstance, PoolState } from '../pool/pool.model'
import { WithdrawButton } from '../pool/WithdrawButton'

interface PreviousPoolsProps {
  address: string
  currentPoolAddress: string
  pools: {[key: string]: PoolInstance}
  onConfirmation: OnConfirmationHandler
}

export const PreviousPools: React.FC<PreviousPoolsProps> = ({ address, currentPoolAddress, onConfirmation, pools }) => {
  return (
    <div>
      <h4>Previous Pools</h4>
      {Object.keys(pools)
        .reverse()
        .map(key => {
          const _pool = pools[key]
          return (
            <div key={_pool.address}>
              <div key={key} style={{ display: 'flex', marginBottom: 5 }}>
                <strong>{key}:</strong>
                <EtherscanLink
                  target={_pool.address}
                  type="address"
                  short={true}
                  style={{ color: _pool.address === currentPoolAddress ? 'red' : 'black', marginLeft: 10 }}
                />
              </div>
              {_pool.playerBalance > 0 && _pool.info.poolState === PoolState.COMPLETE && <WithdrawButton address={address}  onConfirmation={onConfirmation} pool={_pool}/>}
            </div>
          )
        })}
    </div>
  )
}
