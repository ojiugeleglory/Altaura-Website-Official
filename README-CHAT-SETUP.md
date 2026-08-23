# Altaura Chat Widget — Setup Guide (Google Gemini)

This replaces the "Book a Free Session" bubble with a live chat widget that
answers questions about your services and guides visitors to the inquiry
form. It runs on a small serverless function that talks to Google's Gemini
API, so no separate server to manage, Vercel hosts it automatically.

Setup time: about 5 minutes, done once. No credit card required to start.

## 1. Get a Gemini API key

1. Go to [aistudio.google.com](https://aistudio.google.com) and sign in
   with your regular Google account, the same one you'd use for Gmail.
2. Click **Get API key** (usually in the left sidebar or top right).
3. Click **Create API key**, choose or create a Google Cloud project when
   prompted (any name is fine), and it'll generate a key for you.
4. Copy the key. It's a long string of letters and numbers.

## 2. Add the key to Vercel

1. Go to your project on [vercel.com](https://vercel.com).
2. Open **Settings** -> **Environment Variables**.
3. Add a new variable:
   - Name: `GEMINI_API_KEY`
   - Value: the key you copied
   - Apply to: Production (and Preview/Development if you want to test locally)
4. Click **Save**.
5. Redeploy your site (push any small change to GitHub, or use Vercel's
   "Redeploy" button) so the new environment variable takes effect.

## 3. Try it

Visit your live site, click the chat bubble in the bottom right, and ask it
something like "What's included in a Brand Audit?" It should answer using
only the information about your real services, and point people toward the
inquiry form or a free strategy call when it makes sense.

## Notes on the free tier

- This is genuinely free at your scale, no billing required.
- Google's free tier does have daily and per-minute limits. For a small
  business site getting occasional questions, you're very unlikely to hit
  them. If you ever do, visitors just see the "having trouble connecting"
  fallback message with your WhatsApp number, nothing breaks.
- One thing worth knowing: on the free tier, Google may use conversations
  to help improve their models. If that matters to you, Google's paid tier
  turns this off, worth keeping in mind as the site grows.
- Each conversation is capped at the last 10 messages and short replies, to
  keep things focused even if someone chats for a while.

## Customizing what it says

The assistant's instructions live in `api/chat.js`, near the top, in the
`SYSTEM_PROMPT` section. Editing that text changes how it responds, no
other code changes needed, things like tone, what services to mention, or
new FAQ answers.

## Switching models later

`api/chat.js` currently uses `gemini-3.6-flash`. Google occasionally retires
older model names for new API keys, if you ever see a 404 error mentioning
a model name in Vercel's Logs, that error message tells you exactly which
model name to switch to. Just update the `GEMINI_MODEL` constant near the
top of `api/chat.js` to match.
