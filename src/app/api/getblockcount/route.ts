import { getBlockCount } from "@/controllers/rpc-controller"

export async function GET() {
  return getBlockCount()
}