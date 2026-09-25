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
  const { data: courses } = await supabase.from("academy_resources").select("id, published").in("id", [
    "c5832106-b3b1-4ceb-9a10-f0ee57acc5a6",
    "b8e72251-140b-4fa8-a1c2-19e487198701",
    "dae05010-3b7c-48c2-8419-fca72722b510"
  ]);
  courses?.forEach(c => console.log(c.id, "Title:", c.published?.title, "Audience:", c.published?.audience, "Status:", c.published?.status));

  const { data: buckets } = await supabase.storage.listBuckets();
  console.log("Buckets:", buckets?.map(b => ({ id: b.id, name: b.name, public: b.public })));

  const { data: files, error: errFiles } = await supabase.storage.from("academy-private").list("pdf");
  console.log("Files in academy-private/pdf:", errFiles || files?.map(f => f.name));
}
check().catch(console.error);
