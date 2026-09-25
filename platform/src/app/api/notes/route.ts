import { z } from "zod";
import { authenticate, ApiError, requireCourseAccess } from "@/lib/pilot-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store, private" };
const noteSchema = z.object({ courseId: z.string().min(1).max(100), lessonId: z.string().min(1).max(100), content: z.string().max(10000) });
function failure(error: unknown) {
  return Response.json({ error: error instanceof ApiError ? error.message : "Não foi possível acessar o caderno." }, { status: error instanceof ApiError ? error.status : 500, headers });
}
import fs from "node:fs";
import path from "node:path";

function getFallbackPath() {
  const dir = path.resolve(process.cwd(), "data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, "lesson-notes.json");
}

function readFallbackNotes(userId: string, courseId: string): Record<string, string> {
  try {
    const file = getFallbackPath();
    if (!fs.existsSync(file)) return {};
    const text = fs.readFileSync(file, "utf8");
    if (!text || !text.trim()) return {};
    const data = JSON.parse(text);
    return data[`${userId}:${courseId}`] || {};
  } catch {
    return {};
  }
}

function writeFallbackNote(userId: string, courseId: string, lessonId: string, content: string) {
  try {
    const file = getFallbackPath();
    let data: Record<string, Record<string, string>> = {};
    if (fs.existsSync(file)) {
      try {
        const text = fs.readFileSync(file, "utf8");
        if (text && text.trim()) data = JSON.parse(text);
      } catch {}
    }
    const key = `${userId}:${courseId}`;
    if (!data[key]) data[key] = {};
    data[key][lessonId] = content;
    const tmp = `${file}.${Date.now()}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
    try {
      fs.renameSync(tmp, file);
    } catch {
      fs.copyFileSync(tmp, file);
      try { fs.unlinkSync(tmp); } catch {}
    }
  } catch (err) {
    console.error("Erro ao salvar fallback de notas:", err);
  }
}

export async function GET(request: Request) {
  try {
    const { db, me } = await authenticate(request);
    const courseId = new URL(request.url).searchParams.get("courseId") || "";
    await requireCourseAccess(db, me, courseId);
    const result = await db.from("academy_lesson_notes").select("lesson_id,content").eq("user_id", me.id).eq("course_id", courseId);
    if (result.error) {
      if (result.error.code === "PGRST205" || String(result.error.message).includes("academy_lesson_notes")) {
        return Response.json({ notes: readFallbackNotes(me.id, courseId) }, { headers });
      }
      throw new ApiError("Não foi possível carregar o caderno.", 503);
    }
    return Response.json({ notes: Object.fromEntries((result.data || []).map(row => [row.lesson_id, row.content])) }, { headers });
  } catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  try {
    if (Number(request.headers.get("content-length") || 0) > 12000) throw new ApiError("Anotação muito longa.", 413);
    const { db, me } = await authenticate(request);
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > 12000) throw new ApiError("Anotação muito longa.", 413);
    let body: unknown;
    try { body = JSON.parse(raw); } catch { throw new ApiError("Anotação inválida."); }
    const parsed = noteSchema.safeParse(body);
    if (!parsed.success) throw new ApiError("Anotação inválida.");
    const { courseId, lessonId, content } = parsed.data;
    const course = await requireCourseAccess(db, me, courseId);
    if (!course.lessons.some(lesson => lesson.id === lessonId)) throw new ApiError("Aula não encontrada.", 404);
    const result = await db.from("academy_lesson_notes").upsert({ user_id: me.id, course_id: courseId, lesson_id: lessonId, content, updated_at: new Date().toISOString() });
    if (result.error) {
      if (result.error.code === "PGRST205" || String(result.error.message).includes("academy_lesson_notes")) {
        writeFallbackNote(me.id, courseId, lessonId, content);
        return Response.json({ saved: true }, { headers });
      }
      throw new ApiError("Não foi possível salvar a anotação.", 503);
    }
    return Response.json({ saved: true }, { headers });
  } catch (error) { return failure(error); }
}
