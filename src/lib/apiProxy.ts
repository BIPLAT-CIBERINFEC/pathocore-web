import { request as httpRequest, type IncomingHttpHeaders } from "http";
import { request as httpsRequest } from "https";
import type { NextApiRequest, NextApiResponse } from "next";

type ProxyOptions = {
  targetBaseUrl: string;
  path?: string | string[];
  hostHeader?: string;
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function normalizePath(path: string | string[] | undefined) {
  if (Array.isArray(path)) return path.join("/");
  return path ?? "";
}

function appendQueryString(url: URL, query: NextApiRequest["query"]) {
  Object.entries(query).forEach(([key, value]) => {
    if (key === "path" || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, item));
      return;
    }
    url.searchParams.append(key, value);
  });
}

function headerValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.join(", ");
  return value;
}

function getForwardHeaders(req: NextApiRequest, hostHeader?: string) {
  const headers: Record<string, string> = {
    Accept: headerValue(req.headers.accept) ?? "application/json",
  };

  const authorization = headerValue(req.headers.authorization);
  const contentType = headerValue(req.headers["content-type"]);
  if (authorization) {
    headers.Authorization = authorization;
  }
  if (contentType) {
    headers["Content-Type"] = contentType;
  }
  if (hostHeader) {
    headers.Host = hostHeader;
  }
  return headers;
}

function getForwardBody(req: NextApiRequest) {
  if (req.method === "GET" || req.method === "HEAD") return undefined;
  if (req.body === undefined || req.body === null) return undefined;
  if (typeof req.body === "string") {
    return req.body;
  }
  return JSON.stringify(req.body);
}

function requestUpstream(
  targetUrl: URL,
  method: string | undefined,
  headers: Record<string, string>,
  body: string | undefined
) {
  const requestFn = targetUrl.protocol === "https:" ? httpsRequest : httpRequest;

  return new Promise<{
    statusCode: number;
    headers: IncomingHttpHeaders;
    body: Buffer;
  }>((resolve, reject) => {
    const upstreamReq = requestFn(
      targetUrl,
      {
        method,
        headers,
      },
      (upstreamRes) => {
        const chunks: Buffer[] = [];

        upstreamRes.on("data", (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        upstreamRes.on("end", () => {
          resolve({
            statusCode: upstreamRes.statusCode ?? 502,
            headers: upstreamRes.headers,
            body: Buffer.concat(chunks),
          });
        });
      }
    );

    upstreamReq.on("error", reject);
    if (body) upstreamReq.write(body);
    upstreamReq.end();
  });
}

export async function proxyApiRequest(
  req: NextApiRequest,
  res: NextApiResponse,
  options: ProxyOptions
) {
  const targetUrl = new URL(
    `${trimTrailingSlash(options.targetBaseUrl)}/${normalizePath(
      options.path ?? req.query.path
    )}`
  );
  appendQueryString(targetUrl, req.query);

  try {
    const response = await requestUpstream(
      targetUrl,
      req.method,
      getForwardHeaders(req, options.hostHeader),
      getForwardBody(req)
    );

    const contentType = response.headers["content-type"];
    const retryAfter = response.headers["retry-after"];
    if (contentType) res.setHeader("Content-Type", contentType);
    if (retryAfter) res.setHeader("Retry-After", retryAfter);

    return res.status(response.statusCode).send(response.body);
  } catch (error) {
    console.error("API proxy request failed:", error);
    return res.status(502).json({ error: "API proxy request failed" });
  }
}
