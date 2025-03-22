import { getBestBlockHash } from "@/controllers/rpc-controller"

export async function GET() {
    return getBestBlockHash()
}