import { getTransaction } from "@/controllers/electrum.controller";

export async function GET(_request: Request, { params }: { params: Promise<{ txid: string }> }) {
  const { txid } = await params

  return getTransaction(txid)
}