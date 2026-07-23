import type { NextApiRequest, NextApiResponse } from "next";
import { proxyApiRequest } from "@/lib/apiProxy";

const MEPRAM_OMOP_API_PROXY_TARGET =
  process.env.MEPRAM_OMOP_API_PROXY_TARGET || "http://127.0.0.1:8100";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return proxyApiRequest(req, res, {
    targetBaseUrl: MEPRAM_OMOP_API_PROXY_TARGET,
    hostHeader: "localhost",
  });
}
