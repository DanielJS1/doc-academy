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
  const { data: res, error: errRes } = await supabase.from("academy_resources").select("*").limit(3);
  if (errRes) console.error("Error resources:", errRes);
  else console.log("Columns of academy_resources:", Object.keys(res[0] || {}));

  const { data: cartorios, error: errCartorios } = await supabase.from("academy_cartorios").select("*").limit(3);
  if (errCartorios) console.error("Error cartorios:", errCartorios);
  else console.log("Cartorios count:", cartorios?.length, cartorios);
}
check().catch(console.error);
