import tls, { ConnectionOptions } from 'tls'
import * as bitcoin from 'bitcoinjs-lib'
import {
  ElectrumMethod,
  ElectrumResponse,
  GetHistoryResult,
} from '@/models/electrum'
import { TLSSoquetRequest } from '@/models/rpc'
import { randomUUID } from 'crypto'

export const peers: ConnectionOptions[] = [
  { host: 'elx.bitske.com', port: 50002, rejectUnauthorized: false },
  {
    host: 'electrum.jochen-hoenucke.de',
    port: 50002,
    rejectUnauthorized: false,
  },
  { host: 'electrum1.bluewallet.io', port: 443, rejectUnauthorized: false },
  { host: 'electrum.acinq.co', port: 50002, rejectUnauthorized: false },
  { host: 'electrum.bitaroo.net', port: 50002, rejectUnauthorized: false },
]

export default class ElectrumService {
  // Generic function to make Electrum calls
  static async callElectrumMethod<T>(
    method: ElectrumMethod,
    params: unknown[] = [],
  ): Promise<ElectrumResponse<T>> {
    const id = randomUUID()
    const request: TLSSoquetRequest = {
      jsonrpc: '2.0',
      id: id,
      method: method,
      params: params,
    }

    return new Promise((resolve, reject) => {
      const socket = tls.connect(
        peers[Math.floor(Math.random() * peers.length)],
        () => {
          socket.write(JSON.stringify(request) + '\n')
        },
      )

      let buffer = ''
      socket.on('data', data => {
        buffer += data.toString()
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Mantém o restante no buffer
        lines.forEach(line => {
          if (line.trim()) {
            try {
              const response = JSON.parse(line)
              if (response.id === id) {
                if (response.error) {
                  reject(new Error(response.error.message))
                } else {
                  resolve(response)
                }
                socket.end()
              }
            } catch (e) {
              console.error('Erro ao parsear JSON:', line, e)
            }
          }
        })
      })

      socket.on('error', err => {
        console.error(`Erro na conexão Electrum (${method}):`, err)
        reject(err)
      })

      socket.on('end', () => {
        if (!buffer.trim()) {
          reject(new Error('Conexão fechada sem resposta'))
        }
      })
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
  ): Promise<ElectrumResponse<GetHistoryResult>> {
    try {
      const scripthash = this.addressToScriptHash(address)
      const data = await this.callElectrumMethod<GetHistoryResult>(
        'blockchain.scripthash.get_history',
        [scripthash],
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

  static async getAddressBalance(
    address: string,
  ): Promise<ElectrumResponse<unknown>> {
    try {
      const scripthash = this.addressToScriptHash(address)
      const data = await this.callElectrumMethod<unknown>(
        'blockchain.scripthash.get_balance',
        [scripthash],
      )
      return data
    } catch (error) {
      console.error('Erro ao buscar saldo do endereço:', error)
      throw error
    }
  }

  static async getTransaction(txid: string): Promise<Response> {
    try {
      const data = await this.callElectrumMethod<unknown>(
        'blockchain.transaction.get',
        [txid],
      )
      return Response.json(data)
    } catch (error) {
      console.error('Erro ao buscar transação:', error)
      throw error
    }
  }

  static async getServerVersion(): Promise<Response> {
    try {
      const data = await this.callElectrumMethod<string[]>('server.version', [
        'ihodl-api',
        '1.4',
      ])
      return Response.json(data)
    } catch (error) {
      console.error('Erro ao buscar versão do servidor Electrum:', error)
      throw error
    }
  }

  // Adicione outros métodos pertinentes aqui conforme necessário
}
