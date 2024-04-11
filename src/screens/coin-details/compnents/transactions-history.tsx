import React, { useEffect, useState } from "react"
import { BaseWalletDescription, IWalletAsset, useStores } from "models"
import { View } from "react-native"
import styles from "../styles"
import { Text, TransactionRow } from "components"
import {
  getTransactions,
  CryptoTransaction,
  getTransactionStatus,
} from "services/api"
import { MessageType, showMessage } from "react-native-flash-message"

type TransactionsHistoryProps = {
  asset: BaseWalletDescription;
};

const TransactionsHistory = ({ asset }: TransactionsHistoryProps) => {
  const { currentWalletStore, pendingTransactions } = useStores()
  const [prevPndTsx, setPrevPndTsx] = useState(null)
  const { refreshBalances } = currentWalletStore

  const [transactions, setTransactions] = useState<CryptoTransaction[]>([])
  const pndTsx = pendingTransactions?.transactions

  // Every PendingTransaction Update check transaction status and show notification
  const showTsxMessage = ({
                            success,
                            failed,
                          }: {
    success: number;
    failed: number;
  }) => {
    let message: string = ""
    let type: MessageType = "none"

    if (success === 1 && failed === 0) {
      message = "Your pending transaction has succeeded"
      type = "success"
    } else if (failed === 1 && success === 0) {
      message = "Your pending transaction has failed"
      type = "danger"
    } else if (success > 1 && failed === 0) {
      message = "Your pending transactions have succeeded"
      type = "success"
    } else if (failed > 1 && success === 0) {
      message = "Your pending transactions have failed"
      type = "danger"
    } else {
      message = "Your pending transactions status have changed"
      type = "success"
    }

    showMessage({ type, message })
  }

  const _getTransactions = async () => {
    const tsx = await getTransactions(asset)
    setTransactions(tsx)
  }

  const updateTransactions = () => {
    const txList = pendingTransactions.getPendingTxsForAsset(asset)
    txList.forEach(tx => {
      getTransactionStatus(asset, tx.txId)
        .then(status => {
          pendingTransactions.update(tx, { status })

          if (status === "success") {
            pendingTransactions.remove(asset, tx)
            refreshBalances()
          }
          _getTransactions()
        })
        .catch(err => {
          // pendingTransactions.remove(asset, tx)
        })
    })
  }

  useEffect(() => {
    // Get transaction once then once every 10sec
    updateTransactions()
    const interval = setInterval(updateTransactions, 20000)
    if (asset) {
      _getTransactions()
      refreshBalances()
    }
    return () => {
      clearInterval(interval)
    }
  }, [asset.address])

  useEffect(() => {
    const tsxStatuses: any = {}

    const statuses = { success: 0, failed: 0 }
    if (prevPndTsx) {
      if (Array.isArray(pendingTransactions?.transactions)) {
        pendingTransactions.transactions.forEach(tsx => {
          if (tsx.status !== prevPndTsx[tsx.txId] && tsx.status) {
            if (["success"].includes(tsx.status)) {
              statuses.success = statuses.success + 1
            } else if (["failed"].includes(tsx.status)) {
              statuses.failed = statuses.failed + 1
            }
          }
          tsxStatuses[tsx.txId] = tsx.status
        })
        showTsxMessage(statuses)
      }
    } else {
      pendingTransactions?.transactions?.forEach(
        tsx => (tsxStatuses[tsx.txId] = tsx.status),
      )
      setPrevPndTsx(tsxStatuses)
    }
  }, [pndTsx])

  return (
    <>
      {pendingTransactions.getPendingTxsForAsset(asset).length > 0 || (asset.chain !== "AVN" && transactions.length > 0) ? (
        <>
          {pendingTransactions.getPendingTxsForAsset(asset).length > 0 && (
            <View>
              <View style={styles.TRANSACTIONS_HEADER}>
                <Text preset="header" text="Pending transactions" />
              </View>
              <View style={styles.TRANSACTIONS_CONTAINER}>
                {pendingTransactions.getPendingTxsForAsset(asset).map((tx, index) => (
                  <TransactionRow
                    key={tx.txId}
                    asset={asset}
                    onRemove={() => {
                      pendingTransactions.remove(asset, tx)
                    }}
                    transaction={{
                      ...tx,
                      date: null,
                      out: true,
                      hash: "",
                    }}
                  />
                ))}
              </View>
            </View>
          )}

          {asset.chain !== "AVN" && transactions.length > 0 && (
            <View>
              <View style={styles.TRANSACTIONS_HEADER}>
                <Text preset="header" text="Transactions" />
              </View>
              <View style={styles.TRANSACTIONS_CONTAINER}>
                {transactions.map((tx: CryptoTransaction, index: number) => (
                  <TransactionRow key={index} asset={asset} transaction={tx} />
                ))}
              </View>
            </View>
          )}
        </>
      ) : (
        <View>
          <View style={styles.TRANSACTIONS_HEADER}>
            <Text preset="header" text="Transactions" />
          </View>
          <View style={styles.TRANSACTIONS_CONTAINER}>
            <Text preset="fieldLabel" text="No transactions available" />
          </View>
        </View>
      )}
    </>

  )
}

export default TransactionsHistory
