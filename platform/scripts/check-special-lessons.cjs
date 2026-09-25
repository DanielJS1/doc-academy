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
  const { data: res } = await supabase.from("academy_resources").select("id, published").eq("kind", "course");
  console.log("Total courses:", res?.length);
  const withReading = [];
  const withAttachment = [];
  const withVimeo = [];
  res?.forEach(c => {
    const lessons = c.published?.lessons || [];
    lessons.forEach(l => {
      if (l.type === "reading") withReading.push({ courseId: c.id, lesson: l });
      if (l.attachmentPath) withAttachment.push({ courseId: c.id, lesson: l });
      if (l.type === "video" && (l.videoUrl?.includes("vimeo") || (l.videoId && !l.youtubeId))) {
        withVimeo.push({ courseId: c.id, lesson: l });
      }
    });
  });
  console.log("Lessons with reading:", withReading.length, withReading);
  console.log("Lessons with attachment:", withAttachment.length, withAttachment);
  console.log("Lessons with vimeo:", withVimeo.length, withVimeo.slice(0, 3));
}
check().catch(console.error);
