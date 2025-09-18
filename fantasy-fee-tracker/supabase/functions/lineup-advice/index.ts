// Copilot: please create a new file at supabase/functions/lineup-advice/index.ts and insert the following code.
// This function fetches Sleeper league data, builds projections (using your projections table if available),
// and returns start/sit recommendations. Do not modify existing fee‑processing functions.

// New Supabase Edge Function: lineup-advice
// This function generates start/sit recommendations for a Sleeper league roster.
// It fetches roster and matchup data from Sleeper and uses a branch-and-bound
// algorithm to select the best possible lineup based on player projections.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Enable CORS for browser or cross-domain access.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define supported roster slots. Additional variants like REC_FLEX or SUPER_FLEX
// are handled implicitly by eligibility rules.
type Slot =
  | "QB"
  | "RB"
  | "WR"
  | "TE"
  | "K"
  | "DEF"
  | "FLEX"
  | "REC_FLEX"
  | "WRRB"
  | "WRTE"
  | "SUPER_FLEX";

// Define the shape of a projection record.
interface Projection {
  player_id: string;
  points: number;
  floor?: number | null;
  ceiling?: number | null;
}

// Define a candidate player for lineup consideration.
interface Candidate {
  player_id: string;
  name: string;
  pos: string;
  team?: string;
  proj: number;
  floor?: number | null;
  ceiling?: number | null;
}

// Normalize a Sleeper roster position into our Slot type. Unknown or bench
// positions return null to exclude them from consideration.
function normalizeSlot(s: string): Slot | null {
  const u = s.toUpperCase();
  if (["QB", "RB", "WR", "TE", "K", "DEF"].includes(u)) return u as Slot;
  // Map Sleeper combined slots into our common categories
  if (["FLEX", "WRRBTE", "W/R/T"].includes(u)) return "FLEX";
  if (["REC_FLEX", "WRTE", "W/T"].includes(u)) return "REC_FLEX";
  if (["WRRB", "W/R"].includes(u)) return "WRRB";
  if (["QBRBWRTE", "SUPER_FLEX", "Q/W/R/T"].includes(u)) return "SUPER_FLEX";
  // Bench, IR, TAXI and unknown slots are ignored
  return null;
}

// Determine if a player's position is eligible for a given slot.
function eligibleFor(slot: Slot, pos: string): boolean {
  switch (slot) {
    case "QB":
      return pos === "QB";
    case "RB":
      return pos === "RB";
    case "WR":
      return pos === "WR";
    case "TE":
      return pos === "TE";
    case "K":
      return pos === "K";
    case "DEF":
      return pos === "DEF";
    case "FLEX":
      return ["RB", "WR", "TE"].includes(pos);
    case "REC_FLEX":
      return ["WR", "TE"].includes(pos);
    case "WRRB":
      return ["WR", "RB"].includes(pos);
    case "WRTE":
      return ["WR", "TE"].includes(pos);
    case "SUPER_FLEX":
      return ["QB", "RB", "WR", "TE"].includes(pos);
    default:
      return false;
  }
}

// Branch-and-bound lineup optimizer. Given a list of slots and candidate players,
// this returns the optimal assignment of players to slots that maximizes projected points.
function optimize(slots: Slot[], candidates: Candidate[]) {
  // Order slots by how hard they are to fill (fewest eligible candidates first).
  const orderedSlots = [...slots].sort((a, b) => {
    const countA = candidates.filter((c) => eligibleFor(a, c.pos)).length;
    const countB = candidates.filter((c) => eligibleFor(b, c.pos)).length;
    return countA - countB;
  });

  // Build a map of eligible candidates for each slot, sorted by projection.
  const bySlot = new Map<Slot, Candidate[]>();
  for (const slot of new Set(orderedSlots)) {
    const list = candidates
      .filter((c) => eligibleFor(slot, c.pos))
      .sort((a, b) => b.proj - a.proj);
    bySlot.set(slot, list);
  }

  let bestScore = -Infinity;
  let bestAssign: { slot: Slot; cand: Candidate }[] = [];

  // Helper to compute an optimistic upper bound of remaining points.
  function upperBound(i: number, used: Set<string>): number {
    let sum = 0;
    for (let k = i; k < orderedSlots.length; k++) {
      const s = orderedSlots[k];
      const list = bySlot.get(s) || [];
      const best = list.find((c) => !used.has(c.player_id));
      sum += best?.proj ?? 0;
    }
    return sum;
  }

  const used = new Set<string>();
  const current: { slot: Slot; cand: Candidate }[] = [];
  let currentScore = 0;

  function dfs(i: number) {
    if (i === orderedSlots.length) {
      if (currentScore > bestScore) {
        bestScore = currentScore;
        bestAssign = [...current];
      }
      return;
    }
    // Prune if optimistic bound can't beat best.
    if (currentScore + upperBound(i, used) <= bestScore) return;

    const s = orderedSlots[i];
    const list = bySlot.get(s) || [];
    for (const cand of list) {
      if (used.has(cand.player_id)) continue;
      used.add(cand.player_id);
      current.push({ slot: s, cand });
      const prev = currentScore;
      currentScore += cand.proj;
      dfs(i + 1);
      currentScore = prev;
      current.pop();
      used.delete(cand.player_id);
    }
  }

  dfs(0);

  // Collect bench players not used in the optimal lineup.
  const usedIds = new Set(bestAssign.map((x) => x.cand.player_id));
  const bench = candidates
    .filter((c) => !usedIds.has(c.player_id))
    .sort((a, b) => b.proj - a.proj);

  return { starters: bestAssign, bench, total: bestScore };
}

// Fetch league, roster, and user data from Sleeper.
async function fetchSleeperData(
  leagueId: string,
  week: number
): Promise<{
  league: any;
  users: any[];
  rosters: any[];
  matchups: any[];
  players: Record<string, any>;
}> {
  const base = "https://api.sleeper.app/v1";
  const [league, users, rosters, matchups] = await Promise.all([
    fetch(`${base}/league/${leagueId}`).then((r) => r.json()),
    fetch(`${base}/league/${leagueId}/users`).then((r) => r.json()),
    fetch(`${base}/league/${leagueId}/rosters`).then((r) => r.json()),
    fetch(`${base}/league/${leagueId}/matchups/${week}`).then((r) => r.json()),
  ]);
  // Fetch the full player dictionary once; it is large but necessary for positions and names.
  const players = await fetch(`${base}/players/nfl`).then((r) => r.json());
  return { league, users, rosters, matchups, players };
}

// Utility to map a Sleeper user handle to their user_id.
function resolveUserId(
  users: any[],
  opts: { user_id?: string; username?: string; display_name?: string }
): string | null {
  if (opts.user_id) return opts.user_id;
  const key = (opts.username || opts.display_name || "").toLowerCase();
  if (!key) return null;
  const user = users.find(
    (u) =>
      (u.username && u.username.toLowerCase() === key) ||
      (u.display_name && u.display_name.toLowerCase() === key)
  );
  return user?.user_id || null;
}

// The main request handler. Expects a JSON body containing the Sleeper league ID,
// week number, and a user identifier (user_id, username, or display_name).
Deno.serve(async (req) => {
  // Handle CORS preflight.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const {
      league_id,
      week,
      user_id,
      username,
      display_name,
      source = "consensus",
      season,
    } = await req.json();

    if (!league_id || !week) {
      return new Response(
        JSON.stringify({ error: "league_id and week are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch data from Sleeper.
    const data = await fetchSleeperData(league_id, week);

    // Resolve the user ID.
    const myUserId = resolveUserId(data.users, { user_id, username, display_name });
    if (!myUserId) {
      return new Response(
        JSON.stringify({
          error: "Provide user_id or username/display_name to identify your roster",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Find the roster associated with the user.
    const myRoster = data.rosters.find((r) => r.owner_id === myUserId);
    if (!myRoster) {
      return new Response(
        JSON.stringify({ error: "No roster found for that user in this league" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Determine lineup slots from the league's roster positions.
    const rawSlots: string[] = (data.league?.roster_positions || []) as string[];
    // Normalize and filter out bench-like positions.
    const slots: Slot[] = rawSlots
      .map(normalizeSlot)
      .filter((x): x is Slot => x !== null);

    // Build candidate list with projections. Use Supabase if available, otherwise default to 0.
    const candidates: Candidate[] = [];
    const playerIds: string[] = myRoster.players || [];
    // Try to load projections from Supabase if environment variables are set.
    let projMap = new Map<string, Projection>();
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (supabaseUrl && supabaseKey && season) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: rows, error } = await supabase
        .from("projections")
        .select("player_id, points, floor, ceiling")
        .eq("season", season)
        .eq("week", week)
        .eq("source", source);
      if (!error && rows) {
        rows.forEach((r: any) =>
          projMap.set(r.player_id, {
            player_id: r.player_id,
            points: Number(r.points),
            floor: r.floor,
            ceiling: r.ceiling,
          })
        );
      }
    }
    // Construct candidate objects.
    for (const pid of playerIds) {
      const info = data.players[pid];
      if (!info) continue;
      const pos: string = (info.fantasy_positions?.[0] || info.position) as string;
      if (!pos) continue;
      const name: string =
        info.full_name ||
        [info.first_name, info.last_name].filter(Boolean).join(" ") ||
        pid;
      const projection = projMap.get(pid);
      const proj = projection ? projection.points : 0;
      candidates.push({
        player_id: pid,
        name,
        pos,
        team: info.team,
        proj,
        floor: projection?.floor || null,
        ceiling: projection?.ceiling || null,
      });
    }

    // Optimize lineup.
    const { starters, bench, total } = optimize(slots, candidates);

    // Build explanatory output.
    const explanations = starters.map((s) => ({
      slot: s.slot,
      player_id: s.cand.player_id,
      name: s.cand.name,
      pos: s.cand.pos,
      team: s.cand.team,
      projected: s.cand.proj,
      floor: s.cand.floor,
      ceiling: s.cand.ceiling,
      reason: `Selected as the top projected ${s.slot} option`,
    }));

    const responseBody = {
      league_id,
      week,
      season: season || data.league?.season,
      total_projected: total,
      starters: explanations,
      bench: bench.slice(0, 12).map((b) => ({
        player_id: b.player_id,
        name: b.name,
        pos: b.pos,
        projected: b.proj,
      })),
    };

    return new Response(JSON.stringify(responseBody), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});