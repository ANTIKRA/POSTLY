# Postly

A Next.js email composer powered by Resend.

## Local development

1. Run `npm install`.
2. Copy `.env.example` to `.env.local` and set `RESEND_API_KEY` to your Resend sending key. Set `APP_PASSWORD` to a long, unique password to protect the app; the sign-in username is `postly`.
3. Verify `trixeventos.org` in Resend.
4. Run `npm run dev -- -H 127.0.0.1` and open http://127.0.0.1:3000.

## Netlify

Connect this repository and deploy the `main` branch. In Netlify project configuration, add `RESEND_API_KEY` and a long, unique `APP_PASSWORD` as sensitive environment variables for builds and functions, then redeploy. Sign in with username `postly` and that password. On Netlify, the app fails closed if `APP_PASSWORD` is missing. Keep credentials out of Git and rotate any key that has been shared.

Recipients are sent individual messages. A sender address does not create a receiving mailbox. The optional image must be a public direct HTTPS image URL. Drafts and a saved template are local to the current browser. Resend accepting a message does not guarantee inbox placement.

This shared-password gate is for a small trusted group; it does not provide individual user accounts, a full audit trail, or rate limiting. Add those protections before broader public use. Marketing mail also requires appropriate consent and unsubscribe handling.
