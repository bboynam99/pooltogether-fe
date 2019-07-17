import BN from 'bn.js'
import React from 'react'
import { blankAddress } from '../../contracts/contract.model'
import { EntryInfo } from '../../contracts/pool/pool.model'
import { fromWei } from '../../web3'
import { EtherscanLink } from '../EtherscanLink'

interface EntryStatsProps {
  account: string
  entry: EntryInfo
  netWinnings: BN
  grossWinnings: BN
}
export const EntryStats: React.FC<EntryStatsProps> = ({
  account,
  entry: { addr, amount, ticketCount, withdrawn },
  netWinnings,
  grossWinnings,
}: EntryStatsProps) => (
  <div>
    <table>
      <tbody>
        <tr>
          <td>
            <strong>Address:</strong>
          </td>
          <td>
            <EtherscanLink
              target={addr === blankAddress ? account : addr}
              type="address"
              short={true}
            />
          </td>
        </tr>
        <tr>
          <td>
            <strong>Tickets:</strong>
          </td>
          <td>{ticketCount.toString()}</td>
        </tr>
        <tr>
          <td>
            <strong>Deposit:</strong>
          </td>
          <td>{fromWei(amount)} DAI</td>
        </tr>
        <tr>
          <td>
            <strong>Winnings:</strong>
          </td>
          <td>{fromWei(netWinnings)} DAI</td>
        </tr>
        <tr>
          <td>
            <strong>Withdrawn:</strong>
          </td>
          <td>{fromWei(withdrawn)} DAI</td>
        </tr>
        <tr>
          <td>
            <strong>Balance:</strong>
          </td>
          <td>{fromWei(grossWinnings.sub(withdrawn))} DAI</td>
        </tr>
      </tbody>
    </table>
  </div>
)
