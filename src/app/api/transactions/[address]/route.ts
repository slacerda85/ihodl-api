import { getTransactions } from '@/services/transactions.service'

export const maxDuration = 30

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ address: string }> },
) {
  const { address } = await params

  const response = await getTransactions(address)
  return Response.json(response)
}
