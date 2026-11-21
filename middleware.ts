import { NextRequest, NextResponse } from "next/server";

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };

export function middleware(request: NextRequest) {
  const password = process.env.APP_PASSWORD;
  if (!password) {
    if (process.env.NETLIFY === "true") return new NextResponse("This app is not configured yet. Set APP_PASSWORD in Netlify and redeploy.", { status: 503 });
    return NextResponse.next();
  }
  const header = request.headers.get("authorization") || "";
  let credentials = "";
  try { if (header.startsWith("Basic ")) credentials = atob(header.slice(6)); } catch { /* Invalid authorization. */ }
  const separator = credentials.indexOf(":");
  const supplied = separator >= 0 ? credentials.slice(separator + 1) : "";
  if (separator >= 0 && credentials.slice(0, separator) === "postly" && supplied === password) return NextResponse.next();
  return new NextResponse("Sign in to use Postly.", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Postly", charset="UTF-8"', "Cache-Control": "no-store" } });
}
