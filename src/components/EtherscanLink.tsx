import React, { CSSProperties } from 'react'
import { FiExternalLink } from 'react-icons/fi'

interface EtherscanLinkProps {
  target: string
  type: 'address' | 'tx'
  style?: CSSProperties
  short?: boolean
  length?: number
}

export const EtherscanLink: React.FC<EtherscanLinkProps> = ({
  target,
  type,
  style,
  short = false,
  length = 12,
}) => (
  <span style={{ display: 'flex', alignItems: 'center', ...style }}>
    <span>
      {short
        ? `${target.substr(0, length)}......${target.substr(target.length - length)}`
        : target}{' '}
    </span>
    <a
      style={{ marginLeft: 10 }}
      href={`https://etherscan.io/${type}/${target}`}
      title="view transaction on Etherscan.io"
    >
      <FiExternalLink />
    </a>
  </span>
)
