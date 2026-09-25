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
  const { data: cartorios, error } = await supabase.from("academy_cartorios").select("*");
  console.log("Cartorios error:", error);
  console.log("Cartorios data:", cartorios);

  // Try creating a test cartorio
  const testCartorio = {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Cartório Modelo de Homologação E2E",
    status: "active",
    modules: ["todos", "rc", "notas", "ri", "rtdpj"],
    uf: "SP"
  };
  const { data: upsertData, error: upsertErr } = await supabase.from("academy_cartorios").upsert(testCartorio).select();
  console.log("Upsert cartorio:", upsertErr || upsertData);
}
check().catch(console.error);
