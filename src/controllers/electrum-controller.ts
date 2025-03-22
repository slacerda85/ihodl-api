import tls, { ConnectionOptions } from "tls";
import * as bitcoin from "bitcoinjs-lib";

// Define Electrum method types for type safety
export type ElectrumMethod =
  | "server.version"
  | "blockchain.scripthash.get_history"
  | "blockchain.scripthash.get_balance"
  | "blockchain.transaction.get"
  | "blockchain.headers.subscribe";

// Response structure from Electrum
export interface ElectrumResponse<T> {
  result: T;
  error: null | {
    code: number;
    message: string;
  };
  id: string;
}

export const peers: ConnectionOptions[] = [
  { host: "electrum.jochen-hoenucke.de", port: 50002, rejectUnauthorized: false },
  { host: "elx.bitske.com", port: 50002, rejectUnauthorized: false },
  { host: "electrum1.bluewallet.io", port: 443, rejectUnauthorized: false },
  { host: "electrum.acinq.co", port: 50002, rejectUnauthorized: false },
  { host: "electrum.bitaroo.net", port: 50002, rejectUnauthorized: false },
];

// Generic function to make Electrum calls
export async function callElectrumMethod<T>(
  method: ElectrumMethod,
  params: unknown[] = []
): Promise<ElectrumResponse<T>> {
  const id = Math.random().toString(36).substring(2, 15); // Gera um ID único como string
  const request = {
    jsonrpc: "2.0",
    id: id,
    method: method,
    params: params,
  };

  return new Promise((resolve, reject) => {
    const socket = tls.connect(
      peers[Math.floor(Math.random() * peers.length)],
      () => {
        socket.write(JSON.stringify(request) + "\n");
      }
    );

    let buffer = "";
    socket.on("data", (data) => {
      buffer += data.toString();        
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Mantém o restante no buffer
      lines.forEach((line) => {
        if (line.trim()) {
          try {
            const response = JSON.parse(line);
            if (response.id === id) {
              if (response.error) {
                reject(new Error(response.error.message));
              } else {                
                resolve(response);
              }
              socket.end();
            }
          } catch (e) {
            console.error("Erro ao parsear JSON:", line, e);
          }
        }
      });
    });

    socket.on("error", (err) => {
      console.error(`Erro na conexão Electrum (${method}):`, err);
      reject(err);
    });

    socket.on("end", () => {
      if (!buffer.trim()) {
        reject(new Error("Conexão fechada sem resposta"));
      }
    });
  });
}

// Helper function to convert address to scripthash
function addressToScriptHash(address: string): string {
  const script = bitcoin.address.toOutputScript(
    address,
    bitcoin.networks.bitcoin
  );
  const hash = bitcoin.crypto.sha256(script);
  const reversedHash = Buffer.from(hash.reverse());
  return reversedHash.toString("hex");
}

// Specific method implementations

export async function getAddressTxChain(
  address: string
): Promise<Response> {
  try {
    const scripthash = addressToScriptHash(address);
    const data = await callElectrumMethod<unknown>(
      "blockchain.scripthash.get_history",
      [scripthash]
    );    
    return Response.json(data);
  } catch (error) {
    console.error("Erro ao buscar histórico de transações do endereço:", error);
    throw error;
  }
}

export async function getAddressBalance(
  address: string
): Promise<Response> {
  try {
    const scripthash = addressToScriptHash(address);
    const data = await callElectrumMethod<unknown>(
      "blockchain.scripthash.get_balance",
      [scripthash]
    );
    return Response.json(data);
  } catch (error) {
    console.error("Erro ao buscar saldo do endereço:", error);
    throw error;
  }
}

export async function getTransaction(
  txid: string
): Promise<Response> {
  try {
    const data = await callElectrumMethod<unknown>(
      "blockchain.transaction.get",
      [txid]
    );
    return Response.json(data);
  } catch (error) {
    console.error("Erro ao buscar transação:", error);
    throw error;
  }
}

export async function getServerVersion(): Promise<Response> {
  try {
    const data = await callElectrumMethod<string[]>("server.version", [
      "ihodl-api",
      "1.4",
    ]);
    return Response.json(data);
  } catch (error) {
    console.error("Erro ao buscar versão do servidor Electrum:", error);
    throw error;
  }
}

// Adicione outras funções pertinentes aqui conforme necessário
