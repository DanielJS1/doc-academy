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

const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testLogins() {
  const list = [
    { email: "email.colaborador@demaria.com.br", password: "senha_colaborador" },
    { email: "email.gestor@demaria.com.br", password: "senha_gestor" },
    { email: "usuario@cartorio.com.br", password: "senha_cartorio" }
  ];

  for (const item of list) {
    const res = await client.auth.signInWithPassword(item);
    if (res.error) console.error("Login failed for:", item.email, res.error.message);
    else console.log("Login success for:", item.email, "token:", res.data.session?.access_token ? "ok" : "missing");
  }
}

testLogins().catch(console.error);
