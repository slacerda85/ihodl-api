import { getBlock } from "@/controllers/rpc-controller";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ blockhash: string }> }
) {
  const { blockhash } = await params;

  return getBlock(blockhash);
}
