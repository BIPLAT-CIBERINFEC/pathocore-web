import type { NextApiRequest, NextApiResponse } from "next";
import { proxyApiRequest } from "@/lib/apiProxy";

const PATHOCORE_API_PROXY_TARGET =
  process.env.PATHOCORE_API_PROXY_TARGET || "http://127.0.0.1:8000";
const PATHOCORE_API_PROXY_HOST_HEADER =
  process.env.PATHOCORE_API_PROXY_HOST_HEADER || "localhost";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return proxyApiRequest(req, res, {
    targetBaseUrl: `${PATHOCORE_API_PROXY_TARGET}/v1`,
    hostHeader: PATHOCORE_API_PROXY_HOST_HEADER,
  });
}
