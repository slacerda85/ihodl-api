/* import { getBlockHash } from "@/controllers/rpc-controller";

export async function GET(_request: Request, { params }: { params: Promise<{ height: string }> }) {
  const { height } = await params

  const parsedHeight = parseInt(height)

  return getBlockHash(parsedHeight)
}

 */

export async function GET(/* { params }: { params: Promise<{ txid: string }> } */) {
  
  return Response.json({ error: 'Not implemented' }, { status: 501 });
  /* const { txid } = await params  
  return getRawTransaction(txid) */
}