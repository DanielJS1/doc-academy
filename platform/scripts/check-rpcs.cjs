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
  // Test if there's any exec_sql or similar rpc
  const rpcs = ["exec_sql", "execute_sql", "run_sql", "query", "sql"];
  for (const rpc of rpcs) {
    const res = await supabase.rpc(rpc, { query: "SELECT 1" });
    console.log(`RPC ${rpc}:`, res.error ? res.error.message : "EXISTS!");
  }
}
check().catch(console.error);
