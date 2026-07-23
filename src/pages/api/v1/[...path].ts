import type { NextApiRequest, NextApiResponse } from "next";
import { proxyApiRequest } from "@/lib/apiProxy";

const PATHOCORE_API_PROXY_TARGET =
  process.env.PATHOCORE_API_PROXY_TARGET || "http://127.0.0.1:8000";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return proxyApiRequest(req, res, {
    targetBaseUrl: `${PATHOCORE_API_PROXY_TARGET}/api/v1`,
    hostHeader: "localhost",
  });
}
