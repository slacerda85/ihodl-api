import { Tx } from "@/models/transaction";

// Define Bitcoin RPC method types for type safety
export type BitcoinRpcMethod = 
| 'decoderawtransaction'
| 'getblockcount' 
| 'getbestblockhash' 
| 'getblock' 
| 'getblockhash' 
| 'getblockheader'
| 'getconnectioncount'
| 'getdifficulty'
| 'getblockchaininfo'
| 'getmininginfo'
| 'getpeerinfo'
| 'getrawmempool'
| 'getrawtransaction'
| 'importaddress'
| 'listtransactions'

// Response structure from Bitcoin RPC
export interface RpcResponse<T> {
  result: T;
  error: null | {
    code: number;
    message: string;
  };
  id: string;
}

// Generic function to make Bitcoin RPC calls
export async function callRpcMethod<T>(method: BitcoinRpcMethod, params: unknown[] = []): Promise<RpcResponse<T>> {
  const user = process.env.RPC_USER;
  const pass = process.env.RPC_PASS;
  
  try {
    const dataString = JSON.stringify({
      jsonrpc: "1.0",
      id: "curltext",
      method: method,
      params: params
    });
    
    const response = await fetch(`http://127.0.0.1:8332/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Authorization': `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`
      },
      body: dataString
    });

    console.log('call RPC response', response)
    
    if (!response.ok) {
    console.error(response)
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error in RPC call to ${method}:`, error);
    throw error;
  }
}

// Specific method implementations

export async function decodeRawTransaction(rawTx: string): Promise<Response> {
    try {
        const data = await callRpcMethod<number>('decoderawtransaction', [rawTx]);
        return Response.json(data);
    } catch (error) {
        console.error('Error decoding raw transaction:', error);
        return Response.json({ error: 'Failed to decode raw transaction' }, { status: 500 });
    }
}

export async function getBlockCount(): Promise<Response> {
  try {
    const data = await callRpcMethod<number>('getblockcount');
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching block count:', error);
    return Response.json({ error: 'Failed to fetch block count' }, { status: 500 });
  }
}

export async function getBestBlockHash(): Promise<Response> {
  try {
    const data = await callRpcMethod<string>('getbestblockhash');
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching best block hash:', error);
    return Response.json({ error: 'Failed to fetch best block hash' }, { status: 500 });
  }
}

export async function getBlock(blockHash: string): Promise<Response> {
  try {
    const data = await callRpcMethod<number>('getblock', [blockHash]);
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching block:', error);
    return Response.json({ error: 'Failed to fetch block' }, { status: 500 });
  }
}

export async function getBlockHash(height: number): Promise<Response> {
  try {
    const data = await callRpcMethod<string>('getblockhash', [height]);
    
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching block hash:', error);
    return Response.json({ error: 'Failed to fetch block hash' }, { status: 500 });
  }
}

export async function getConnectionCount(): Promise<Response> {
  try {
    const data = await callRpcMethod<number>('getconnectioncount');
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching connection count:', error);
    return Response.json({ error: 'Failed to fetch connection count' }, { status: 500 });
  }
}

export async function getDifficulty(): Promise<Response> {
  try {
    const data = await callRpcMethod<number>('getdifficulty');
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching difficulty:', error);
    return Response.json({ error: 'Failed to fetch difficulty' }, { status: 500 });
  }
}

export async function getBlockChainInfo(): Promise<Response> {
  try {
    const data = await callRpcMethod<number>('getblockchaininfo');
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching blockchain info:', error);
    return Response.json({ error: 'Failed to fetch blockchain info' }, { status: 500 });
  }
}

export async function getMiningInfo(): Promise<Response> {
  try {
    const data = await callRpcMethod<number>('getmininginfo');
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching mining info:', error);
    return Response.json({ error: 'Failed to fetch mining info' }, { status: 500 });
  }
}

export async function getPeerInfo(): Promise<Response> {
  try {
    const data = await callRpcMethod<number>('getpeerinfo');
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching peer info:', error);
    return Response.json({ error: 'Failed to fetch peer info' }, { status: 500 });
  }
}

export async function getRawMemPool(): Promise<Response> {
  try {
    const data = await callRpcMethod<number>('getrawmempool');
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching raw mempool:', error);
    return Response.json({ error: 'Failed to fetch raw mempool' }, { status: 500 });
  }
}

export async function getRawTransaction(txid: string): Promise<Response> {
  try {
    const data = await callRpcMethod<Tx>('getrawtransaction', [txid]);
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching raw transaction:', error);
    return Response.json({ error: 'Failed to fetch raw transaction' }, { status: 500 });
  }
}

// Can be extended with more Bitcoin RPC methods as needed