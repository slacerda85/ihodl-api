/* import { getBlock } from "@/controllers/rpc-controller";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ blockhash: string }> }
) {
  const { blockhash } = await params;

  return getBlock(blockhash);
}
 */

export async function GET(/* { params }: { params: Promise<{ txid: string }> } */) {
  
  return Response.json({ error: 'Not implemented' }, { status: 501 });
  /* const { txid } = await params  
  return getRawTransaction(txid) */
}