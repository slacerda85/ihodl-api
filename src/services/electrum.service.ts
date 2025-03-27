import tls, { ConnectionOptions, TLSSocket } from 'tls'
import * as bitcoin from 'bitcoinjs-lib'
import {
  ElectrumMethod,
  ElectrumResponse,
  GetHistoryResult,
} from '@/models/electrum'
import { JsonRpcRequest } from '@/models/rpc'
import { randomUUID } from 'crypto'
import { Tx } from '@/models/transaction'

export const peers: ConnectionOptions[] = [
  { host: 'electrum.coinb.in', port: 50002, rejectUnauthorized: false },
  {
    host: 'electrumx.electricnewyear.net',
    port: 50002,
    rejectUnauthorized: false,
  },
  { host: 'guichet.centure.cc', port: 50002, rejectUnauthorized: false },
  { host: 'electrum1.bluewallet.io', port: 443, rejectUnauthorized: false },
  { host: 'electrum.blockchain.info', port: 50002, rejectUnauthorized: false },
]

export default class ElectrumService {
  // Connect to an Electrum server and return the socket
  static connect(): Promise<TLSSocket> {
    return new Promise((resolve, reject) => {
      const selectedPeer = peers[Math.floor(Math.random() * peers.length)]
      const socket = tls.connect(selectedPeer, () => {
        resolve(socket)
      })

      socket.on('error', err => {
        console.error(`Erro ao conectar ao servidor Electrum:`, err)
        reject(err)
      })
    })
  }

  // Close a socket connection
  static close(socket: TLSSocket): void {
    if (socket && !socket.destroyed) {
      socket.end()
    }
  }

  // Generic function to make Electrum calls
  static async callElectrumMethod<T>(
    method: ElectrumMethod,
    params: unknown[] = [],
    existingSocket?: TLSSocket,
  ): Promise<ElectrumResponse<T>> {
    const id = randomUUID()
    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      id: id,
      method: method,
      params: params,
    }

    // Track if we created the socket or are using an existing one
    const managedSocket = !existingSocket

    return new Promise(async (resolve, reject) => {
      try {
        // Use provided socket or create a new one
        const socket = existingSocket || (await this.connect())

        socket.write(JSON.stringify(request) + '\n')

        let buffer = ''

        const dataHandler = (data: Buffer) => {
          buffer += data.toString()
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // Mantém o restante no buffer

          lines.forEach(line => {
            if (line.trim()) {
              try {
                const response = JSON.parse(line)
                if (response.id === id) {
                  cleanup()

                  if (response.error) {
                    reject(new Error(response.error.message))
                  } else {
                    resolve(response)
                  }
                }
              } catch (e) {
                console.error('Erro ao parsear JSON:', line, e)
              }
            }
          })
        }

        const errorHandler = (err: Error) => {
          console.error(`Erro na conexão Electrum (${method}):`, err)
          cleanup()
          reject(err)
        }

        const endHandler = () => {
          if (!buffer.trim()) {
            cleanup()
            reject(new Error('Conexão fechada sem resposta'))
          }
        }

        // Function to clean up event listeners and close socket if needed
        const cleanup = () => {
          socket.removeListener('data', dataHandler)
          socket.removeListener('error', errorHandler)
          socket.removeListener('end', endHandler)

          // Only close if we created this socket
          if (managedSocket) {
            this.close(socket)
          }
        }

        // Set up event handlers
        socket.on('data', dataHandler)
        socket.on('error', errorHandler)
        socket.on('end', endHandler)
      } catch (error) {
        reject(error)
      }
    })
  }

  // Helper function to convert address to scripthash
  static addressToScriptHash(address: string): string {
    const script = bitcoin.address.toOutputScript(
      address,
      bitcoin.networks.bitcoin,
    )
    const hash = bitcoin.crypto.sha256(script)
    const reversedHash = Buffer.from(hash.reverse())
    return reversedHash.toString('hex')
  }

  // Specific method implementations
  static async getAddressTxHistory(
    address: string,
    socket?: TLSSocket,
  ): Promise<ElectrumResponse<GetHistoryResult[]>> {
    try {
      const scripthash = this.addressToScriptHash(address)
      const data = await this.callElectrumMethod<GetHistoryResult[]>(
        'blockchain.scripthash.get_history',
        [scripthash],
        socket,
      )
      return data
    } catch (error) {
      console.error(
        'Erro ao buscar histórico de transações do endereço:',
        error,
      )
      throw error
    }
  }

  static async getTransaction(
    tx_hash: string,
    verbose: boolean = false,
    // blockHash?: string,
    socket?: TLSSocket,
  ): Promise<ElectrumResponse<Tx>> {
    try {
      const data = await this.callElectrumMethod<Tx>(
        'blockchain.transaction.get',
        [tx_hash, verbose],
        socket,
      )
      return data
    } catch (error) {
      console.error('Erro ao buscar saldo do endereço:', error)
      throw error
    }
  }

  static async getBlockHash(
    height: number,
    socket?: TLSSocket,
  ): Promise<ElectrumResponse<string>> {
    try {
      const data = await this.callElectrumMethod<string>(
        'blockchain.block.get_header',
        [height],
        socket,
      )
      return data
    } catch (error) {
      console.error('Erro ao buscar hash do bloco:', error)
      throw error
    }
  }
  /**
   * Get all transactions for an address
   */
  static async getTransactions(
    address: string,
    socket?: TLSSocket,
  ): Promise<Tx[]> {
    const MINIMUN_CONFIRMATIONS = 3

    try {
      // Create a socket if not provided to reuse for multiple calls
      const managedSocket = !socket
      const usedSocket = socket || (await this.connect())

      try {
        // Get transaction history for address
        const historyResponse = await this.getAddressTxHistory(
          address,
          usedSocket,
        )
        const history = historyResponse.result

        // Fetch full transaction details for each transaction in history
        const transactions: Tx[] = []

        for (const { tx_hash } of history) {
          const txResponse = await this.getTransaction(
            tx_hash,
            true,
            usedSocket,
          )

          const tx = txResponse.result
          const confirmations = tx.confirmations || 0

          // Filter out unconfirmed transactions
          if (confirmations < MINIMUN_CONFIRMATIONS) {
            continue
          }

          transactions.push(tx)
        }

        return transactions
      } finally {
        // Close socket if we created it
        if (managedSocket && usedSocket) {
          this.close(usedSocket)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar transações do endereço:', error)
      throw error
    }
  }

  /**
   * Get balance for an address (corrected implementation)
   * Balance calculation considers both incoming and outgoing transactions
   */
  static async getBalance(
    address: string,
    socket?: TLSSocket,
  ): Promise<ElectrumResponse<number>> {
    try {
      // Create a socket if not provided to reuse for multiple calls
      const managedSocket = !socket
      const usedSocket = socket || (await this.connect())

      try {
        // Get the scripthash for the address
        const scripthash = this.addressToScriptHash(address)

        // Use blockchain.scripthash.get_balance for direct balance calculation
        // This is more efficient than manually iterating through transactions
        const balanceData = await this.callElectrumMethod<{
          confirmed: number
          unconfirmed: number
        }>('blockchain.scripthash.get_balance', [scripthash], usedSocket)

        // Convert from satoshis to BTC
        const balance =
          (balanceData.result.confirmed + balanceData.result.unconfirmed) /
          100000000

        return {
          result: balance,
          error: null,
          id: balanceData.id,
        }
      } finally {
        // Close socket if we created it
        if (managedSocket && usedSocket) {
          this.close(usedSocket)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar saldo do endereço:', error)
      throw error
    }
  }
}
