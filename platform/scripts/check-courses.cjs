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
  const { data: res, error: errRes } = await supabase.from("academy_resources").select("id, kind, published").eq("kind", "course");
  if (errRes) console.error("Error resources:", errRes);
  else {
    console.log("Found courses:", res?.length);
    res?.forEach(c => {
      const p = c.published || {};
      const lessons = p.lessons || [];
      console.log(`Course: id=${c.id}, title="${p.title}", audience="${p.audience}", lessons=${lessons.length}`);
      lessons.forEach((l, i) => console.log(`   [${i}] id=${l.id}, type=${l.type}, title="${l.title}", minutes=${l.minutes}, attachmentPath=${l.attachmentPath || 'none'}`));
    });
  }
}
check().catch(console.error);
