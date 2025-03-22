import { getBlockHash } from "@/controllers/rpc-controller";

export async function GET(_request: Request, { params }: { params: Promise<{ height: string }> }) {
  const { height } = await params

  const parsedHeight = parseInt(height)

  return getBlockHash(parsedHeight)
}

