// =============================================================
// World Cup Portfolio Game — Shared App Logic
// =============================================================
// SETUP: Replace these two values with your Supabase project's
// URL and anon key (see SETUP.md for instructions).
// =============================================================

const SUPABASE_URL = 'https://itadojsyosjpidijumbx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0YWRvanN5b3NqcGlkaWp1bWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNDg0ODYsImV4cCI6MjA5NjYyNDQ4Nn0.pcSBsbu2j4PIsYWBMYx9jTCoDvNgPYJN1hVZFWrDX6Q';

// ── Game Constants ────────────────────────────────────────────
const BUDGET = 100;
const WAIVER_BUDGET = 10;
const UNDERDOG_THRESHOLD = 5;  // price ≤ this → underdog
const UNDERDOG_MULTIPLIER = 2;
const ADMIN_PASSWORD = 'worldcup2026';

// ── Rounds and Scoring ────────────────────────────────────────
// 2026 format: 48 teams → R32 (32 advance) → R16 → QF → SF → Final
const ROUNDS = [
  { id: 'group',    label: 'Group Stage',       desc: 'Advance to Round of 32',  points: 5  },
  { id: 'r32',      label: 'Round of 32',        desc: 'Win Round of 32',          points: 5  },
  { id: 'r16',      label: 'Round of 16',        desc: 'Win Round of 16',          points: 5  },
  { id: 'qf',       label: 'Quarterfinal',       desc: 'Win Quarterfinal',         points: 10 },
  { id: 'sf',       label: 'Semifinal',          desc: 'Win Semifinal',            points: 15 },
  { id: 'final',    label: 'Final',              desc: 'Win the Final',            points: 25 },
  { id: 'champion', label: 'Champion Bonus',     desc: 'Champion bonus',           points: 20 },
];

const ROUND_POINTS = Object.fromEntries(ROUNDS.map(r => [r.id, r.points]));

// ── Team Data (all 48 qualified nations) ──────────────────────
// Prices: Tier 1 = 15-20pts, Tier 2 = 10-14pts,
//         Tier 3 = 6-9pts,   Tier 4 = 2-5pts (underdogs 2×)
const TEAMS = [
  // ── TIER 1: Elite Favorites (15–20 pts) ──────────────────
  { id: 'france',      name: 'France',           flag: '🇫🇷', confederation: 'UEFA',     price: 20, group: 'I'  },
  { id: 'spain',       name: 'Spain',            flag: '🇪🇸', confederation: 'UEFA',     price: 19, group: 'H'  },
  { id: 'argentina',   name: 'Argentina',        flag: '🇦🇷', confederation: 'CONMEBOL', price: 18, group: 'J'  },
  { id: 'brazil',      name: 'Brazil',           flag: '🇧🇷', confederation: 'CONMEBOL', price: 18, group: 'C'  },
  { id: 'england',     name: 'England',          flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', confederation: 'UEFA',     price: 17, group: 'L'  },
  { id: 'portugal',    name: 'Portugal',         flag: '🇵🇹', confederation: 'UEFA',     price: 16, group: 'K'  },
  { id: 'germany',     name: 'Germany',          flag: '🇩🇪', confederation: 'UEFA',     price: 15, group: 'E'  },

  // ── TIER 2: Strong Contenders (10–14 pts) ────────────────
  { id: 'netherlands', name: 'Netherlands',      flag: '🇳🇱', confederation: 'UEFA',     price: 14, group: 'F'  },
  { id: 'morocco',     name: 'Morocco',          flag: '🇲🇦', confederation: 'CAF',      price: 13, group: 'C'  },
  { id: 'belgium',     name: 'Belgium',          flag: '🇧🇪', confederation: 'UEFA',     price: 13, group: 'G'  },
  { id: 'croatia',     name: 'Croatia',          flag: '🇭🇷', confederation: 'UEFA',     price: 12, group: 'L'  },
  { id: 'colombia',    name: 'Colombia',         flag: '🇨🇴', confederation: 'CONMEBOL', price: 12, group: 'K'  },
  { id: 'uruguay',     name: 'Uruguay',          flag: '🇺🇾', confederation: 'CONMEBOL', price: 11, group: 'H'  },
  { id: 'japan',       name: 'Japan',            flag: '🇯🇵', confederation: 'AFC',      price: 11, group: 'F'  },
  { id: 'usa',         name: 'United States',    flag: '🇺🇸', confederation: 'CONCACAF', price: 10, group: 'D'  },

  // ── TIER 3: Dark Horses (6–9 pts) ────────────────────────
  { id: 'mexico',      name: 'Mexico',           flag: '🇲🇽', confederation: 'CONCACAF', price: 9,  group: 'A'  },
  { id: 'senegal',     name: 'Senegal',          flag: '🇸🇳', confederation: 'CAF',      price: 9,  group: 'I'  },
  { id: 'switzerland', name: 'Switzerland',      flag: '🇨🇭', confederation: 'UEFA',     price: 8,  group: 'B'  },
  { id: 'south_korea', name: 'South Korea',      flag: '🇰🇷', confederation: 'AFC',      price: 8,  group: 'A'  },
  { id: 'turkey',      name: 'Türkiye',          flag: '🇹🇷', confederation: 'UEFA',     price: 8,  group: 'D'  },
  { id: 'ecuador',     name: 'Ecuador',          flag: '🇪🇨', confederation: 'CONMEBOL', price: 7,  group: 'E'  },
  { id: 'austria',     name: 'Austria',          flag: '🇦🇹', confederation: 'UEFA',     price: 7,  group: 'J'  },
  { id: 'australia',   name: 'Australia',        flag: '🇦🇺', confederation: 'AFC',      price: 7,  group: 'D'  },
  { id: 'canada',      name: 'Canada',           flag: '🇨🇦', confederation: 'CONCACAF', price: 6,  group: 'B'  },
  { id: 'norway',      name: 'Norway',           flag: '🇳🇴', confederation: 'UEFA',     price: 6,  group: 'I'  },

  // ── TIER 4: Underdogs — 2× Points! (2–5 pts) ─────────────
  { id: 'iran',        name: 'Iran',             flag: '🇮🇷', confederation: 'AFC',      price: 5,  group: 'G'  },
  { id: 'algeria',     name: 'Algeria',          flag: '🇩🇿', confederation: 'CAF',      price: 5,  group: 'J'  },
  { id: 'paraguay',    name: 'Paraguay',         flag: '🇵🇾', confederation: 'CONMEBOL', price: 5,  group: 'D'  },
  { id: 'sweden',      name: 'Sweden',           flag: '🇸🇪', confederation: 'UEFA',     price: 4,  group: 'F'  },
  { id: 'egypt',       name: 'Egypt',            flag: '🇪🇬', confederation: 'CAF',      price: 4,  group: 'G'  },
  { id: 'ivory_coast', name: 'Ivory Coast',      flag: '🇨🇮', confederation: 'CAF',      price: 4,  group: 'E'  },
  { id: 'czechia',     name: 'Czechia',          flag: '🇨🇿', confederation: 'UEFA',     price: 4,  group: 'A'  },
  { id: 'scotland',    name: 'Scotland',         flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', confederation: 'UEFA',     price: 4,  group: 'C'  },
  { id: 'ghana',       name: 'Ghana',            flag: '🇬🇭', confederation: 'CAF',      price: 4,  group: 'L'  },
  { id: 'tunisia',     name: 'Tunisia',          flag: '🇹🇳', confederation: 'CAF',      price: 4,  group: 'F'  },
  { id: 'bosnia',      name: 'Bosnia & Herzegovina', flag: '🇧🇦', confederation: 'UEFA', price: 3,  group: 'B'  },
  { id: 'dr_congo',    name: 'DR Congo',         flag: '🇨🇩', confederation: 'CAF',      price: 3,  group: 'K'  },
  { id: 'qatar',       name: 'Qatar',            flag: '🇶🇦', confederation: 'AFC',      price: 3,  group: 'B'  },
  { id: 'saudi_arabia',name: 'Saudi Arabia',     flag: '🇸🇦', confederation: 'AFC',      price: 3,  group: 'H'  },
  { id: 'iraq',        name: 'Iraq',             flag: '🇮🇶', confederation: 'AFC',      price: 3,  group: 'I'  },
  { id: 'south_africa',name: 'South Africa',     flag: '🇿🇦', confederation: 'CAF',      price: 3,  group: 'A'  },
  { id: 'panama',      name: 'Panama',           flag: '🇵🇦', confederation: 'CONCACAF', price: 3,  group: 'L'  },
  { id: 'cape_verde',  name: 'Cape Verde',       flag: '🇨🇻', confederation: 'CAF',      price: 3,  group: 'H'  },
  { id: 'jordan',      name: 'Jordan',           flag: '🇯🇴', confederation: 'AFC',      price: 2,  group: 'J'  },
  { id: 'uzbekistan',  name: 'Uzbekistan',       flag: '🇺🇿', confederation: 'AFC',      price: 2,  group: 'K'  },
  { id: 'new_zealand', name: 'New Zealand',      flag: '🇳🇿', confederation: 'OFC',      price: 2,  group: 'G' /* via inter-conf */ },
  { id: 'haiti',       name: 'Haiti',            flag: '🇭🇹', confederation: 'CONCACAF', price: 2,  group: 'C'  },
  { id: 'curacao',     name: 'Curaçao',          flag: '🇨🇼', confederation: 'CONCACAF', price: 2,  group: 'E'  },
];

// ── Helpers ───────────────────────────────────────────────────

function getTeamById(id) {
  return TEAMS.find(t => t.id === id) || null;
}

function isUnderdog(team) {
  return team.price <= UNDERDOG_THRESHOLD;
}

function getMultiplier(team) {
  return isUnderdog(team) ? UNDERDOG_MULTIPLIER : 1;
}

/** Calculate a player's current score given their picks and results. */
function calculateScore(playerName, teamIds, allResults) {
  let activeTeamIds = [...teamIds];

  // Build a lookup: round → Set of advanced team_ids
  const advancedByRound = {};
  for (const result of allResults) {
    if (result.advanced) {
      if (!advancedByRound[result.round]) advancedByRound[result.round] = new Set();
      advancedByRound[result.round].add(result.team_id);
    }
  }

  let totalScore = 0;
  const breakdown = {};

  for (const teamId of activeTeamIds) {
    const team = getTeamById(teamId);
    if (!team) continue;
    const mult = getMultiplier(team);
    let teamTotal = 0;
    const teamRoundBreakdown = {};

    for (const round of ROUNDS) {
      const set = advancedByRound[round.id];
      if (set && set.has(teamId)) {
        const pts = round.points * mult;
        teamTotal += pts;
        teamRoundBreakdown[round.id] = pts;
      }
    }

    breakdown[teamId] = { team, score: teamTotal, rounds: teamRoundBreakdown, isUnderdog: isUnderdog(team) };
    totalScore += teamTotal;
  }

  return { totalScore, breakdown, activeTeamIds };
}

/** Initialize and return a Supabase client. */
function createSupabaseClient() {
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
    console.warn('⚠️ Supabase not configured. See SETUP.md.');
    return null;
  }
  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/** Format a number with a leading + for positive values. */
function fmtPts(n) {
  return n > 0 ? `+${n}` : `${n}`;
}

/** Show an alert banner inside a container. */
function showAlert(containerId, message, type = 'error') {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/** Group teams by confederation. */
function groupByConfederation(teams) {
  const order = ['UEFA', 'CONMEBOL', 'CONCACAF', 'AFC', 'CAF', 'OFC'];
  const groups = {};
  for (const conf of order) groups[conf] = [];
  for (const team of teams) {
    if (groups[team.confederation]) groups[team.confederation].push(team);
    else groups[team.confederation] = [team];
  }
  return groups;
}

/** Group teams by tier/price bracket. */
function groupByTier(teams) {
  const tiers = [
    { label: '⭐ Tier 1 — Elite Favorites',      range: [15, 99], emoji: '🔥' },
    { label: '🔵 Tier 2 — Strong Contenders',    range: [10, 14], emoji: '💪' },
    { label: '🟡 Tier 3 — Dark Horses',           range: [6, 9],  emoji: '⚡' },
    { label: '🟢 Tier 4 — Underdogs (2× pts!)',   range: [0, 5],  emoji: '🐆' },
  ];
  return tiers.map(tier => ({
    ...tier,
    teams: teams.filter(t => t.price >= tier.range[0] && t.price <= tier.range[1]),
  }));
}
