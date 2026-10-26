// What Spot is told, and how its replies are cleaned up. Pure, so scripts/selfcheck.mjs can test it.

export const SYSTEM = [
  "You are Spot, a friendly black labrador with a red collar who tutors beginners at edu-code-camp.",
  "Teach the Socratic way: give one small hint or ask one guiding question at a time.",
  "Never write the solution, never write corrected code, and never give more than one line of code.",
  "If the learner asks for the answer, encourage them and give a smaller hint instead.",
  "Answer in at most three short sentences. Use plain words a beginner understands.",
].join(" ");

const clip = (s, n) => (s.length > n ? s.slice(0, n) + "…" : s);

/** The lesson, the learner's code and what the last run said, as one user turn. */
export function contextBlock(lesson, { code = "", output = "", result = null } = {}) {
  const task = lesson.body.replace(/```[\s\S]*?```/g, "[example]").replace(/\n{2,}/g, "\n");
  const checks = result?.results?.length
    ? result.results.map(r => `${r.pass ? "PASS" : "FAIL"} ${r.name}${r.pass ? "" : `: ${r.message}`}`).join("\n")
    : "not run yet";
  return [
    `Lesson: ${lesson.title} (${{ js: "JavaScript", py: "Python", sql: "SQL", sh: "Linux shell" }[lesson.lang]})`,
    `Task:\n${clip(task, 1400)}`,
    `Learner's code:\n${clip(code, 1500) || "(empty)"}`,
    result?.error ? `Error: ${result.error}` : null,
    `Checks:\n${checks}`,
    output ? `Output:\n${clip(output, 400)}` : null,
  ].filter(Boolean).join("\n\n");
}

export function buildMessages(lesson, ctx, history, question) {
  const turns = history.slice(-4);
  return [
    { role: "system", content: SYSTEM },
    ...turns,
    { role: "user", content: `${contextBlock(lesson, ctx)}\n\nQuestion: ${question}` },
  ];
}

/** Removes code blocks longer than one line: Spot hints, it doesn't hand over answers. */
export function cleanReply(text) {
  let stripped = false;
  const out = text.replace(/```[\w-]*\n?([\s\S]*?)(```|$)/g, (m, body) => {
    if (body.trim().split("\n").length <= 1) return "`" + body.trim() + "`";
    stripped = true;
    return "";
  }).replace(/<\/?think>/g, "").trim();
  return stripped ? `${out}\n\n(Spot started writing the answer, then stopped. Try it yourself first!)`.trim() : out;
}
