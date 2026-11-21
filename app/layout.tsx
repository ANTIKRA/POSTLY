import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Postly — thoughtful email, simply sent", description: "A calmer way to send email." };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
