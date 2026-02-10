import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: authError } = await supabaseClient.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;

    const body = await req.json();

    // Validate input structure and limits
    if (body.sessions && !Array.isArray(body.sessions)) {
      return new Response(
        JSON.stringify({ error: "Invalid sessions format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (body.sessions && body.sessions.length > 100) {
      return new Response(
        JSON.stringify({ error: "Too many sessions (max 100)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (body.snapshots && (!Array.isArray(body.snapshots) || body.snapshots.length > 500)) {
      return new Response(
        JSON.stringify({ error: "Invalid snapshots format or too many (max 500)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize and type-coerce input data
    const sessions = (body.sessions ?? []).map((s: any) => ({
      average_score: Number(s.average_score) || null,
      total_alerts: Number(s.total_alerts) || 0,
      user_id: String(s.user_id ?? ""),
    }));

    const snapshots = (body.snapshots ?? []).map((s: any) => ({
      neck_angle: Number(s.neck_angle) || null,
      spine_angle: Number(s.spine_angle) || null,
      shoulder_alignment: Number(s.shoulder_alignment) || null,
    }));

    // Verify data belongs to authenticated user
    for (const s of sessions) {
      if (s.user_id && s.user_id !== userId) {
        return new Response(
          JSON.stringify({ error: "Forbidden" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (sessions.length === 0) {
      return new Response(
        JSON.stringify({ insights: ["Start monitoring your posture to get personalized AI insights!"] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const avgScore = sessions
      .filter((s: any) => s.average_score != null)
      .reduce((sum: number, s: any) => sum + s.average_score, 0) /
      sessions.filter((s: any) => s.average_score != null).length || 0;

    const totalAlerts = sessions.reduce((sum: number, s: any) => sum + s.total_alerts, 0);
    const sessionCount = sessions.length;

    // Analyze snapshot patterns
    let neckIssues = 0;
    let spineIssues = 0;
    let shoulderIssues = 0;
    for (const snap of snapshots) {
      if (snap.neck_angle && snap.neck_angle < 150) neckIssues++;
      if (snap.spine_angle && snap.spine_angle > 15) spineIssues++;
      if (snap.shoulder_alignment && snap.shoulder_alignment < 80) shoulderIssues++;
    }

    const prompt = `You are a posture health expert AI. Analyze this user's posture data and provide 3-5 personalized, actionable insights. Be encouraging but honest.

Data:
- Average posture score: ${Math.round(avgScore)}/100
- Total sessions: ${sessionCount}
- Total posture alerts: ${totalAlerts}
- Neck angle issues detected: ${neckIssues} times
- Spine alignment issues: ${spineIssues} times
- Shoulder balance issues: ${shoulderIssues} times

Respond with a JSON array of insight strings. Each insight should be 1-2 sentences. Focus on specific, practical advice. Example format: ["insight 1", "insight 2", "insight 3"]`;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API returned ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content ?? "[]";

    // Parse JSON from response
    let insights: string[];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      insights = jsonMatch ? JSON.parse(jsonMatch[0]) : [content];
    } catch {
      insights = [content];
    }

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI insights error:", error);
    return new Response(
      JSON.stringify({ insights: ["Unable to generate insights at the moment. Keep monitoring your posture!"], error: error.message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
