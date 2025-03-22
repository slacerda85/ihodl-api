import { getRawTransaction } from "@/controllers/rpc-controller";

export async function GET({ params }: { params: Promise<{ txid: string }> }) {
  const { txid } = await params  
  return getRawTransaction(txid)
}