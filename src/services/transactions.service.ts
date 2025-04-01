import ElectrumService from '@/services/electrum.service'

export async function getTransactions(address: string) {
  try {
    const getTransactionsResponse =
      await ElectrumService.getTransactions(address)
    return getTransactionsResponse
  } catch (error) {
    console.log('Erro ao buscar transações do endereço:', error)
  }
}

export async function getBalance(address: string) {
  try {
    const getTransactionsResponse =
      await ElectrumService.getBalance(address)
    if (!getTransactionsResponse) {
      
      console.log('Nenhum dado retornado para o endereço:', address)
      return 0 // Retorna 0 se não houver dados de transação
    }

    return getTransactionsResponse
  } catch (error) {
    console.log('Erro ao buscar transações do endereço:', error)
  }
}
