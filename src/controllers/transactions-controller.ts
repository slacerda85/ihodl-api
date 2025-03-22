import { callRpcMethod } from './rpc-controller';

// Interface para o formato das transações retornadas por listtransactions
interface Transaction {
  address: string;
  category: string; // "send" ou "receive"
  amount: number;
  label: string;
  vout: number;
  fee?: number; // Opcional, presente apenas para envios
  confirmations: number;
  blockhash: string;
  blockindex: number;
  blocktime: number;
  txid: string;
  time: number;
  timereceived: number;
  bip125_replaceable: string; // "yes" ou "no"
  abandoned?: boolean; // Opcional
}

// Função para buscar transações de um endereço
export async function getAddressTxChain(
  address: string,
  label: string = '', // Etiqueta opcional para o endereço
  count: number = 10, // Número de transações a retornar
  skip: number = 0   // Número de transações a pular
): Promise<Transaction[]> {
  try {
    // Passo 1: Importar o endereço para a carteira do nó
    const importResponse = await callRpcMethod<null>('importaddress', [
      address,   // Endereço Bitcoin
      label,     // Etiqueta para identificar o endereço
      false      // Não rescane a blockchain (mais rápido)
    ]);

    if (importResponse.error) {
      throw new Error(`Erro ao importar endereço: ${importResponse.error.message}`);
    }

    // Passo 2: Listar as transações associadas ao endereço
    const listResponse = await callRpcMethod<Transaction[]>('listtransactions', [
      label,            // Filtra por etiqueta (vazio para todas as transações watch-only)
      count,            // Número de transações a retornar
      skip,             // Número de transações a pular
      true              // Incluir transações watch-only
    ]);

    if (listResponse.error) {
      throw new Error(`Erro ao listar transações: ${listResponse.error.message}`);
    }

    return listResponse.result; // Retorna o array de transações
  } catch (error) {
    console.error(`Erro ao buscar transações para o endereço ${address}:`, error);
    throw error;
  }
}