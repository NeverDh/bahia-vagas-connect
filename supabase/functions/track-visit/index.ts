import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + "bahiavagas-salt-2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function parseDevice(ua: string): { device: string; browser: string; os: string } {
  let device = "Desktop";
  if (/mobile|android|iphone|ipad|ipod/i.test(ua)) {
    device = /ipad|tablet/i.test(ua) ? "Tablet" : "Mobile";
  }

  let browser = "Outro";
  if (/edg/i.test(ua)) browser = "Edge";
  else if (/chrome/i.test(ua)) browser = "Chrome";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";
  else if (/opera|opr/i.test(ua)) browser = "Opera";

  let os = "Outro";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/mac/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad/i.test(ua)) os = "iOS";

  return { device, browser, os };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { page_url, page_title, session_id, referrer, is_admin } = body;

    // Get IP from request
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const ipHash = await hashIP(ip);
    const userAgent = req.headers.get("user-agent") || "";
    const { device, browser, os } = parseDevice(userAgent);

    // Try geolocation from Cloudflare headers
    const country = req.headers.get("cf-ipcountry") || "BR";
    const city = req.headers.get("cf-ipcity") || null;
    const region = req.headers.get("cf-region") || null;

    // Upsert visitor
    const { data: existingVisitor } = await supabase
      .from("analytics_visitors")
      .select("id, visit_count")
      .eq("ip_hash", ipHash)
      .maybeSingle();

    let visitorId: string;

    if (existingVisitor) {
      visitorId = existingVisitor.id;
      await supabase
        .from("analytics_visitors")
        .update({
          last_visit: new Date().toISOString(),
          is_returning: true,
          visit_count: existingVisitor.visit_count + 1,
          is_admin: is_admin || false,
        })
        .eq("id", visitorId);
    } else {
      const { data: newVisitor } = await supabase
        .from("analytics_visitors")
        .insert({
          ip_hash: ipHash,
          is_admin: is_admin || false,
        })
        .select("id")
        .single();
      visitorId = newVisitor!.id;
    }

    // Create or reuse session
    let currentSessionId = session_id;

    if (!currentSessionId) {
      const { data: newSession } = await supabase
        .from("analytics_sessions")
        .insert({
          visitor_id: visitorId,
          device,
          browser,
          os,
          country,
          city,
          region,
          referrer: referrer || null,
          is_admin: is_admin || false,
        })
        .select("id")
        .single();
      currentSessionId = newSession!.id;
    }

    // Record page view
    await supabase.from("analytics_page_views").insert({
      session_id: currentSessionId,
      page_url,
      page_title: page_title || null,
    });

    return new Response(
      JSON.stringify({
        session_id: currentSessionId,
        visitor_id: visitorId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Track visit error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
