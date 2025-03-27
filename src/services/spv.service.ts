import http from 'http'
import { JsonRpcRequest, JsonRpcResponse, RpcConfig } from '@/models/rpc'

// extends proccess.env to include rpcuser and rpcpassword
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      RPC_USER: string
      RPC_PASSWORD: string
    }
  }
}

// Configuration for your Bitcoin Core RPC
const rpcConfig: RpcConfig = {
  host: 'https://ihodl-api.ddns.net',
  port: 8332,
  username: process.env.RPC_USER, // Replace with your rpcuser from bitcoin.conf
  password: process.env.RPC_PASSWORD, // Replace with your rpcpassword from bitcoin.conf
}

// Function to send an RPC request to Bitcoin Core
function sendRpcRequest<T = any>(
  method: string,
  params: any[] = [],
): Promise<T> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      jsonrpc: '1.0',
      id: 'node-spv',
      method: method,
      params: params,
    } as JsonRpcRequest)

    const auth = Buffer.from(
      `${rpcConfig.username}:${rpcConfig.password}`,
    ).toString('base64')
    const options: http.RequestOptions = {
      hostname: rpcConfig.host,
      port: rpcConfig.port,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
        'Content-Length': Buffer.byteLength(postData),
      },
    }

    const req = http.request(options, (res: http.IncomingMessage) => {
      let data = ''
      res.on('data', (chunk: Buffer | string) => (data += chunk))
      res.on('end', () => {
        try {
          const response = JSON.parse(data) as JsonRpcResponse
          if (response.error) {
            reject(new Error(response.error.message))
          } else {
            resolve(response.result as T)
          }
        } catch (err) {
          reject(err)
        }
      })
    })

    req.on('error', (err: Error) => reject(err))
    req.write(postData)
    req.end()
  })
}

// Bitcoin Core API types
interface BlockchainInfo {
  chain: string
  blocks: number
  headers: number
  bestblockhash: string
  difficulty: number
  mediantime: number
  verificationprogress: number
  initialblockdownload: boolean
  chainwork: string
  size_on_disk: number
  pruned: boolean
}

// Example: Get blockchain info
async function getBlockchainInfo(): Promise<void> {
  try {
    const info = await sendRpcRequest<BlockchainInfo>('getblockchaininfo')
    console.log('Blockchain Info:', info)
  } catch (err) {
    console.error('Error:', err instanceof Error ? err.message : String(err))
  }
}

// Run the example
getBlockchainInfo()
