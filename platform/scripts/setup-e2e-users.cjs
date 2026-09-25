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

const usersToCreate = [
  {
    email: "email.colaborador@demaria.com.br",
    password: "senha_colaborador",
    name: "Colaborador E2E",
    role: "student",
    audience: "internal",
    department: "Geral",
    cartorio_id: null
  },
  {
    email: "email.gestor@demaria.com.br",
    password: "senha_gestor",
    name: "Gestor E2E",
    role: "manager",
    audience: "internal",
    department: "Geral",
    cartorio_id: null
  },
  {
    email: "usuario@cartorio.com.br",
    password: "senha_cartorio",
    name: "Cliente Cartório E2E",
    role: "student",
    audience: "client",
    department: "Cartório",
    cartorio_id: "00000000-0000-0000-0000-000000000001"
  }
];

async function setupUsers() {
  const { data: list, error: errList } = await supabase.auth.admin.listUsers();
  if (errList) throw errList;

  for (const item of usersToCreate) {
    let authUser = list.users.find(u => u.email === item.email);
    if (!authUser) {
      console.log(`Creating user in Supabase Auth: ${item.email}`);
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: item.email,
        password: item.password,
        email_confirm: true,
        user_metadata: { name: item.name }
      });
      if (createErr) throw createErr;
      authUser = created.user;
    } else {
      console.log(`Updating user password/meta in Supabase Auth: ${item.email}`);
      const { data: updated, error: updErr } = await supabase.auth.admin.updateUserById(authUser.id, {
        password: item.password,
        email_confirm: true,
        user_metadata: { name: item.name }
      });
      if (updErr) throw updErr;
      authUser = updated.user;
    }

    const profileData = {
      id: authUser.id,
      name: item.name,
      email: item.email,
      department: item.department,
      manager_id: null,
      role: item.role,
      status: "active",
      audience: item.audience,
      cartorio_id: item.cartorio_id,
      avatar: null
    };

    console.log(`Upserting academy_profile for: ${item.email}`);
    const { error: profErr } = await supabase.from("academy_profiles").upsert(profileData);
    if (profErr) throw profErr;
    console.log(`Profile ready for ${item.email}: role=${item.role}, audience=${item.audience}, status=active`);
  }
}

setupUsers().catch(console.error);
