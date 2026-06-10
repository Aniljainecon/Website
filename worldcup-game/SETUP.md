# World Cup Portfolio Game — Setup Guide

Complete setup in ~10 minutes. No coding required.

---

## Step 1: Create a Free Supabase Project

1. Go to **[supabase.com](https://supabase.com)** and sign up for a free account (or log in).
2. Click **"New Project"**.
3. Fill in:
   - **Organization**: Your personal org (or create one)
   - **Project name**: `worldcup-game` (or anything you like)
   - **Database password**: Choose a strong password and save it somewhere
   - **Region**: Pick the closest to you
4. Click **"Create new project"** and wait ~2 minutes for it to provision.

---

## Step 2: Create the Database Tables

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar.
2. Click **"New query"**.
3. Paste the following SQL and click **"Run"**:

```sql
-- Table: player picks
CREATE TABLE picks (
  id           bigserial PRIMARY KEY,
  player_name  text      NOT NULL,
  team_ids     text[]    NOT NULL,
  submitted_at timestamptz DEFAULT now()
);

-- Table: round results (which teams advanced)
CREATE TABLE results (
  id         bigserial PRIMARY KEY,
  round      text      NOT NULL,
  team_id    text      NOT NULL,
  advanced   boolean   DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(round, team_id)
);

-- Table: waiver wire moves
CREATE TABLE waivers (
  id              bigserial PRIMARY KEY,
  player_name     text NOT NULL,
  dropped_team_id text NOT NULL,
  picked_team_id  text NOT NULL,
  created_at      timestamptz DEFAULT now()
);

-- Allow public read/write (this is a casual friend game — no auth needed)
ALTER TABLE picks   ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE waivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access to picks"   ON picks   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to results" ON results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to waivers" ON waivers FOR ALL USING (true) WITH CHECK (true);
```

You should see "Success. No rows returned." — that means it worked.

---

## Step 3: Get Your Supabase Credentials

1. In your Supabase dashboard, click **"Settings"** (gear icon) in the left sidebar.
2. Click **"API"** under the Configuration section.
3. You need two values:
   - **Project URL** — looks like `https://xxxxxxxxxxxx.supabase.co`
   - **anon public key** — a long string starting with `eyJ...`

---

## Step 4: Add Your Credentials to the App

Open the file **`app.js`** in a text editor. Near the top, find these two lines:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

Replace them with your actual values:

```javascript
const SUPABASE_URL = 'https://xxxxxxxxxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

Save the file.

---

## Step 5: Test Locally (Optional)

Open `index.html` directly in your browser. You can browse the app, but Supabase calls may be blocked by CORS in some browsers when opening from `file://`. Use a simple local server if needed:

```bash
# Python 3
python -m http.server 8080
# Then open: http://localhost:8080
```

Or just skip this step and test after deploying to Netlify.

---

## Step 6: Deploy to Netlify (Free, Drag & Drop)

1. Go to **[netlify.com](https://netlify.com)** and create a free account (or log in).
2. From the Netlify dashboard, scroll down to find the **"Deploy manually"** section with a drag-and-drop zone. It says something like *"drag and drop your site folder here"*.
3. Drag the entire **`worldcup-game/`** folder onto that drop zone.
4. Netlify will upload and deploy in seconds. You'll get a URL like `https://random-name-123.netlify.app`.
5. Share that URL with your friends!

> **Tip**: To update the site later (e.g., after you paste in your Supabase keys), just drag and drop the folder again. Netlify keeps a deployment history.

---

## File Structure

```
worldcup-game/
├── index.html        ← Home page / game rules
├── pick.html         ← Team selection page
├── leaderboard.html  ← Live standings
├── admin.html        ← Results entry (password-protected)
├── app.js            ← Shared data, team list, scoring logic
├── style.css         ← All styles
└── SETUP.md          ← This file
```

---

## Admin Panel

- URL: `yoursite.netlify.app/admin.html`
- Password: **`worldcup2026`**
- After each round, log in and check which teams advanced, then click "Save" for that round.
- Use the Waiver Wire tab after the group stage to record player waiver moves.

To change the password, edit `app.js` and change:
```javascript
const ADMIN_PASSWORD = 'worldcup2026';
```

---

## Scoring Summary

| Round | Regular | Underdog (≤5 pts) 🐆 |
|-------|---------|---------------------|
| Group Stage (advance to R32) | +5 | +10 |
| Round of 32 win | +5 | +10 |
| Round of 16 win | +5 | +10 |
| Quarterfinal win | +10 | +20 |
| Semifinal win | +15 | +30 |
| Final win | +25 | +50 |
| Champion Bonus | +20 | +40 |
| **Max per team** | **85 pts** | **170 pts** |

---

## Troubleshooting

**"Supabase not configured" warning?**
→ Make sure you pasted your URL and anon key into `app.js` (Step 4).

**Teams submitting but not showing on leaderboard?**
→ Check that you ran all the SQL in Step 2, especially the RLS policies.

**Getting a CORS error in the browser console?**
→ Test from Netlify (not from a local `file://` path), or use a local HTTP server.

**Want to reset all picks (e.g., for a new game)?**
→ In Supabase SQL Editor, run: `TRUNCATE picks, results, waivers;`

---

## 2026 World Cup Key Dates

- **June 11**: Tournament begins (Mexico vs South Africa, Azteca)
- **June 11 – July 1**: Group stage
- **July 1–5**: Round of 32
- **July 5–8**: Round of 16
- **July 11–12**: Quarterfinals
- **July 15–16**: Semifinals
- **July 19**: Final (MetLife Stadium, New York/New Jersey)

Good luck! ⚽🏆
