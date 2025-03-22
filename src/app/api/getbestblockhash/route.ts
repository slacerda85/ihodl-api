/* import { getBestBlockHash } from "@/controllers/rpc-controller"

export async function GET() {
    return getBestBlockHash()
} */

    export async function GET(/* { params }: { params: Promise<{ txid: string }> } */) {
  
        return Response.json({ error: 'Not implemented' }, { status: 501 });
        /* const { txid } = await params  
        return getRawTransaction(txid) */
      }