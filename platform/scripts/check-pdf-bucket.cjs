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
  const filePath = "pdf/c395446a-adb1-4c27-8fbc-b067804d8517.pdf";
  const { data: list, error: errList } = await supabase.storage.from("academy-pdfs").list("pdf");
  console.log("List academy-pdfs/pdf:", list?.map(f => f.name));

  const signed = await supabase.storage.from("academy-pdfs").createSignedUrl(filePath, 60);
  console.log("Signed URL result:", signed);

  if (signed.error) {
    console.log("Uploading dummy PDF for test...");
    const pdfHeader = Buffer.from("%PDF-1.4\n%âãÏÓ\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 300 144]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000018 00000 n\n0000000063 00000 n\n0000000115 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n193\n%%EOF\n");
    const up = await supabase.storage.from("academy-pdfs").upload(filePath, pdfHeader, { contentType: "application/pdf", upsert: true });
    console.log("Upload result:", up);
    const signedAgain = await supabase.storage.from("academy-pdfs").createSignedUrl(filePath, 60);
    console.log("Signed URL after upload:", signedAgain);
  }
}
check().catch(console.error);
