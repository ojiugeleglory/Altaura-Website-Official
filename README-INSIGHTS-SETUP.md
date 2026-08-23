# Altaura Insights — Setup Guide

This adds a blog-style "Insights" section to the site, plus a private admin
panel at `/admin.html` where you can write, edit, and publish posts without
touching code. It uses Supabase as a free backend (database + login + image
storage), and Vercel keeps deploying the site exactly as it does now.

Total setup time: about 10 minutes, done once.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (free tier is enough).
2. Click **New Project**. Name it anything (e.g. "altaura-insights"). Choose a
   region close to your audience. Set a database password and save it somewhere safe.
3. Wait about a minute for the project to finish setting up.

## 2. Create the posts table

1. In your Supabase project, open **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open `sql/insights_schema.sql` from this project, copy all of it, and paste it in.
4. Click **Run**. You should see "Success. No rows returned."

## 3. Create the image storage bucket

1. In Supabase, open **Storage** in the left sidebar.
2. Click **New bucket**.
3. Name it exactly: `insights-images`
4. Toggle it to **Public bucket** (so cover images can be viewed on the live site).
5. Click **Create bucket**.

## 4. Create your admin login

1. In Supabase, open **Authentication** -> **Users**.
2. Click **Add user** -> **Create new user**.
3. Enter the email and password you want to log into `/admin.html` with.
4. Leave "Auto Confirm User" checked, then click **Create user**.

You can add more admin users the same way later if someone else on your team needs access.

## 5. Connect the site to your Supabase project

1. In Supabase, open **Project Settings** -> **API**.
2. Copy the **Project URL**.
3. Copy the **anon public** key (not the service_role key).
4. Open `js/supabase-config.js` in this project and paste them in:

```js
const SUPABASE_URL = "https://your-project-ref.supabase.co";
const SUPABASE_ANON_KEY = "your-long-anon-key-here";
```

5. Save, commit, and push to GitHub as usual. Vercel will redeploy automatically.

## 6. Using it

- **Write a post:** go to `yoursite.com/admin.html`, sign in, click **New Post**.
  Fill in the title (the URL slug fills in automatically), category, an optional
  excerpt, a cover image, and the body. The body supports simple Markdown:
  `**bold**`, `*italic*`, `## Heading`, `> Quote`, and `- list items`.
- **Save as a draft:** leave "Published" unchecked and click **Save Post**. It
  won't appear on the live site until you check it and save again.
- **Publish:** check "Published" and click **Save Post**. It appears
  immediately on `/insights.html`, newest first.
- **Edit or delete:** from the admin post list, click **Edit** or **Delete** on
  any post.

## Notes

- `/admin.html` isn't linked anywhere on the public site. Anyone who finds the
  URL still needs your email and password to see or change anything — the
  database itself also enforces this (see the row-level security policies in
  `sql/insights_schema.sql`), so it's protected even if the page URL leaks.
- There's no cost at this scale. Supabase's free tier covers far more traffic
  and storage than a site like this will use.
- If you ever want a second admin, add them in Supabase Authentication -> Users
  exactly as in step 4.
