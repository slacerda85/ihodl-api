import {getAddressTransactions} from '@/services/transactions.service'

export async function GET(_request: Request, { params }: { params: Promise<{ address: string }> }) {
  const { address } = await params

  const response = await getAddressTransactions(address)
  return Response.json(response)
}