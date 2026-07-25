import { NextRequest, NextResponse } from "next/server";

/**
 * Runtime API proxy for all /api/* requests.
 *
 * Next.js rewrites are baked at build time, so they can't read
 * runtime env vars on platforms like Railway that use Docker.
 * This catch-all route handler proxies requests at runtime instead.
 */
function getBackendUrl(): string {
  return (
    process.env.BACKEND_URL || "http://localhost:8000"
  ).replace(/\/$/, "");
}

async function proxyRequest(request: NextRequest) {
  const backendUrl = getBackendUrl();
  const { pathname, search } = request.nextUrl;
  const targetUrl = `${backendUrl}${pathname}${search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    // Skip host and connection headers
    if (!["host", "connection", "transfer-encoding"].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
  };

  // Forward request body for non-GET/HEAD methods
  if (!["GET", "HEAD"].includes(request.method)) {
    fetchOptions.body = await request.text();
  }

  try {
    const res = await fetch(targetUrl, fetchOptions);

    const responseHeaders = new Headers();
    res.headers.forEach((value, key) => {
      if (!["transfer-encoding", "content-encoding"].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    const body = await res.arrayBuffer();
    return new NextResponse(body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error(`[API Proxy] Failed to reach backend at ${targetUrl}:`, error.message);
    return NextResponse.json(
      { detail: "Backend service unavailable. Please try again shortly." },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest) {
  return proxyRequest(request);
}

export async function POST(request: NextRequest) {
  return proxyRequest(request);
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request);
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request);
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request);
}
