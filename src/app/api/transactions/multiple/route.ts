import { getTransactionsMultipleAddresses } from '@/services/transactions.service'

export const maxDuration = 30

export async function POST(request: Request) {
  const { addresses } = await request.json()
  if (!Array.isArray(addresses)) {
    return Response.json({ error: 'Invalid addresses format' }, { status: 400 })
  }const response = await getTransactionsMultipleAddresses(addresses)
  return Response.json(response)
}