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

async function fixRevisions() {
  const { data: res } = await supabase.from("academy_resources").select("id, revision, published").eq("kind", "course");
  for (const c of res) {
    if (c.published?.version && c.revision !== c.published.version) {
      console.log(`Fixing ${c.id}: updating revision from ${c.revision} to ${c.published.version}`);
      const { error } = await supabase.from("academy_resources").update({ revision: c.published.version }).eq("id", c.id);
      if (error) console.error("Error updating:", error);
      else console.log("Updated successfully!");
    }
  }
}
fixRevisions().catch(console.error);
