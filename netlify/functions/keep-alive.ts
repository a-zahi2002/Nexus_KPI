import type { Config } from "@netlify/functions";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

export default async function handler() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("[keep-alive] Missing Supabase env vars");
    return new Response("Missing env vars", { status: 500 });
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/members?select=reg_no&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`[keep-alive] Supabase responded with ${response.status}`);
      return new Response(`Supabase error: ${response.status}`, { status: 502 });
    }

    console.log("[keep-alive] Supabase ping successful —", new Date().toISOString());
    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error("[keep-alive] Fetch failed:", err);
    return new Response("Fetch failed", { status: 500 });
  }
}

export const config: Config = {
  schedule: "@daily",
};
