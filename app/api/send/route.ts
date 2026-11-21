import { NextResponse } from "next/server";
const DOMAIN = "trixeventos.org";
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c));
export async function POST(request: Request) {
  const key = process.env.RESEND_API_KEY;
  if (!key || key === "re_your_api_key") return NextResponse.json({ error: "Email is not configured. Contact your administrator." }, { status: 503 });
  try {
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).host !== request.headers.get("host")) return NextResponse.json({ error: "Request rejected." }, { status: 403 });
    const { to, subject, message, sender, senderName, mediaUrl, documentUrl = "", handbook = false } = await request.json();
    if (typeof to !== "string" || typeof subject !== "string" || typeof message !== "string" || typeof sender !== "string" || typeof senderName !== "string" || typeof mediaUrl !== "string" || typeof documentUrl !== "string" || typeof handbook !== "boolean" || documentUrl.length > 2048 || (handbook && !documentUrl.trim()) || to.length > 20000 || !/^[a-zA-Z0-9]+(?:[._+-][a-zA-Z0-9]+)*$/.test(sender) || sender.length > 64 || !senderName.trim() || senderName.length > 100 || /[\x00-\x1f\x7f<>]/.test(senderName) || !subject.trim() || !message.trim() || subject.length > 200 || message.length > 100000 || mediaUrl.length > 2048 || /[\r\n]/.test(subject)) return NextResponse.json({ error: "Check the sender, recipients, subject, and message." }, { status: 400 });
    const recipients = to.split(/[,;\n]+/).map((email: string) => email.trim()).filter(Boolean);
    if (!recipients.length || recipients.length > 100 || recipients.some((email: string) => !/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(email))) return NextResponse.json({ error: "Enter 1 to 100 valid email addresses, separated by commas or new lines." }, { status: 400 });
    const unique = [...new Map(recipients.map((email: string) => [email.toLowerCase(), email])).values()] as string[];
    const link = mediaUrl.trim();
    if (link) { try { const parsed = new URL(link); if (parsed.protocol !== 'https:' || parsed.username || parsed.password || !/\.(png|jpe?g|gif|webp)$/i.test(parsed.pathname)) throw new Error(); } catch { return NextResponse.json({ error: "Use a direct HTTPS image link ending in .jpg, .png, .gif, or .webp. A webpage link cannot be embedded as an image." }, { status: 400 }); } }
    const documentLink = documentUrl.trim();
    if (documentLink) { try { const parsed = new URL(documentLink); if (parsed.protocol !== "https:" || parsed.username || parsed.password) throw new Error(); } catch { return NextResponse.json({ error: "Enter a valid HTTPS handbook link." }, { status: 400 }); } }
    const text = message + (documentLink ? `\n\nOpen handbook: ${documentLink}` : "") + (link ? `\n\nMedia: ${link}` : "");
    const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#253a34;white-space:pre-wrap">${escapeHtml(message)}</div>` + (documentLink ? `<p><a href="${escapeHtml(documentLink)}" style="display:inline-block;padding:12px 20px;background:#16474b;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold">Open handbook</a></p><p style="font-size:12px;color:#425d55;overflow-wrap:anywhere">${escapeHtml(documentLink)}</p>` : "") + (link ? `<p><img src="${escapeHtml(link)}" alt="Image included with this message" style="display:block;max-width:100%;height:auto;border:0" /></p>` : "");
    const display = senderName.trim().replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const messages = unique.map(email => ({ from: `"${display}" <${sender}@${DOMAIN}>`, to: [email], subject: subject.trim(), text, html }));
    const response = await fetch("https://api.resend.com/emails/batch", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(messages), cache: "no-store" });
    if (!response.ok) { const result = await response.json().catch(() => ({})); return NextResponse.json({ error: typeof result.message === "string" ? result.message : "Resend couldn't accept these messages. Check the domain setup." }, { status: response.status }); }
    return NextResponse.json({ ok: true, count: unique.length });
  } catch { return NextResponse.json({ error: "The result is unknown. Check your Resend dashboard before retrying to avoid duplicate messages." }, { status: 500 }); }
}
