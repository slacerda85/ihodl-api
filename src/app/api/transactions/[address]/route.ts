import { getAddressTxChain } from "@/controllers/transactions-controller";

export async function GET(_request: Request, { params }: { params: Promise<{ address: string }> }) {
  const { address } = await params

  return getAddressTxChain(address)
}