import ElectrumService from '@/services/electrum.service'

export async function getTransactions(address: string) {
  try {
    const getTransactionsResponse =
      await ElectrumService.getTransactions(address)
    return getTransactionsResponse
  } catch (error) {
    throw error
  }
}

export async function getBalance(address: string) {
  try {
    const getBalanceResponse = await ElectrumService.getBalance(address)
    return getBalanceResponse
  } catch (error) {
    throw error
  }
}
