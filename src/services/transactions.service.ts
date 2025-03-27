import ElectrumService from '@/services/electrum.service'

export async function getAddressTransactions(address: string) {
  try {
    // first, get tx history from address
    const getTxHistoryResponse =
      await ElectrumService.getAddressTxHistory(address)
    // then, for each txid, get the transaction details
    return Response.json(getTxHistoryResponse)
  } catch (error) {
    throw error
  }
}
