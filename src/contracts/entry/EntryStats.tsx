import React from 'react'
import { EtherscanLink } from '../../components/EtherscanLink'
import { fromWei } from '../../web3'
import { blankAddress } from '../contract.model'
import { EntryInfo } from './entry.model'

interface EntryStatsProps {
  account: string
  entry: EntryInfo
  winnings: number
}
export const EntryStats: React.FC<EntryStatsProps> = ({
  account,
  entry: { addr, amount, ticketCount, withdrawn },
  winnings,
}: EntryStatsProps) => (
  <div>
    <table>
      <tbody>
        <tr>
          <td>
            <strong>Address:</strong>
          </td>
          <td><EtherscanLink target={addr === blankAddress ? account : addr} type="address" short={true} /></td>
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
          <td>{fromWei(amount.toString())} DAI</td>
        </tr>
        <tr>
          <td>
            <strong>Winnings:</strong>
          </td>
          <td>{fromWei(String(winnings - amount))} DAI</td>
        </tr>
        <tr>
          <td>
            <strong>Withdrawn:</strong>
          </td>
          <td>{fromWei(withdrawn.toString())} DAI</td>
        </tr>
        <tr>
          <td>
            <strong>Balance:</strong>
          </td>
          <td>{fromWei(String(winnings - withdrawn))} DAI</td>
        </tr>
      </tbody>
    </table>
  </div>
)
