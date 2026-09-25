const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envPath = path.resolve(__dirname, "../.env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: users, error: errUsers } = await supabase.auth.admin.listUsers();
  if (errUsers) console.error("Error users:", errUsers);
  else {
    console.log("=== USERS IN AUTH ===");
    users.users.forEach(u => console.log("-", u.id, u.email));
  }

  const { data: profiles, error: errProfiles } = await supabase.from("academy_profiles").select("*");
  if (errProfiles) console.error("Error profiles:", errProfiles);
  else {
    console.log("=== ACADEMY PROFILES ===");
    profiles?.forEach(p => console.log("-", p.id, p.email, "role:", p.role, "audience:", p.audience, "status:", p.status, "cartorio_id:", p.cartorio_id));
  }

  const { data: resources, error: errRes } = await supabase.from("academy_resources").select("id, kind, title, audience, published, payload");
  if (errRes) console.error("Error resources:", errRes);
  else {
    console.log("=== ACADEMY RESOURCES (COURSES) ===");
    resources?.filter(r => r.kind === "course").forEach(c => {
      const lessons = c.payload?.lessons || [];
      console.log("- Course:", c.id, `"${c.title}"`, "audience:", c.audience, "published:", c.published, "lessons:", lessons.length);
      lessons.forEach((l, i) => console.log(`   [${i}] type: ${l.type}, title: "${l.title}", minutes: ${l.minutes}, attachmentPath: ${l.attachmentPath || 'none'}`));
    });
  }
}
check().catch(console.error);
