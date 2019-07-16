import React from 'react'
import { FiEye } from 'react-icons/fi'
import { EtherscanLink } from './EtherscanLink'
import { OnConfirmationHandler } from '../contracts/contract.model'
import { PoolInstance, PoolState } from '../contracts/pool/pool.model'
import { WithdrawButton } from './pool/WithdrawButton'

interface PreviousPoolsProps {
  address: string
  currentPoolAddress: string
  pools: { [key: string]: PoolInstance }
  onConfirmation: OnConfirmationHandler
  setPoolToView: (poolNum: string) => void
}

export const PreviousPools: React.FC<PreviousPoolsProps> = ({
  address,
  currentPoolAddress,
  onConfirmation,
  pools,
  setPoolToView,
}) => {
  return (
    <div>
      <h4>Previous Pools</h4>
      {Object.keys(pools)
        .reverse()
        .map((key, i) => {
          const _pool = pools[key]
          const isCurrent = i === 0
          const isViewing = _pool.address === currentPoolAddress
          const lineItem = (
            <div>
              <div key={key} style={{ display: 'flex', marginBottom: 5 }}>
                <strong>{key}:</strong>
                <EtherscanLink
                  target={_pool.address}
                  type="address"
                  short={true}
                  length={7}
                  style={{
                    color: isViewing ? 'red' : 'black',
                    marginLeft: 10,
                  }}
                />
                <span
                  style={{ marginLeft: 10, cursor: 'pointer', color: isViewing ? 'red' : 'black' }}
                  onClick={() => setPoolToView(key)}
                >
                  <FiEye />
                </span>
              </div>
              {Number(_pool.playerBalance.toString()) > 0 &&
                _pool.info.poolState === PoolState.COMPLETE && (
                  <WithdrawButton address={address} onConfirmation={onConfirmation} pool={_pool} />
                )}
            </div>
          )
          return isCurrent ? (
            <div key={_pool.address} style={{ borderRadius: 3, padding: 10, backgroundColor: '#eee' }}>
              <h4 style={{ marginTop: 0, marginBottom: 5 }}>Current pool</h4>
              <span>{lineItem}</span>
            </div>
          ) : (
            <div key={_pool.address}>{lineItem}</div>
          )
        })}
    </div>
  )
}
