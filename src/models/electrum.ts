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

export type GetHistoryResult = {
    tx_hash: string;
    height: number;
}