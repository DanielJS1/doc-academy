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
  const res = await supabase.rpc("academy_save_video_progress", {
    actor: "8fcfaa81-9b4e-4480-9144-24e6222e7fba",
    command: {
      type: "video",
      courseId: "c5832106-b3b1-4ceb-9a10-f0ee57acc5a6",
      version: 1,
      lessonId: "81fe5677-6e72-4188-af92-ffcf467aee08",
      duration: 2220,
      position: 10,
      ranges: [[0, 10]]
    }
  });
  console.log("academy_save_video_progress RPC result:", res);
}
check().catch(console.error);
