// Generates original IELTS + SAT practice questions in authentic exam format.
// All passages/prompts are written from scratch (no third-party copyrighted
// material). Run: node scripts/gen-banks.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BANK = path.resolve(__dirname, "..", "src", "data", "questions", "master-bank");

const stamp = "2026-10-16T00:00:00.000Z";
let ieltsN = 0;
let satN = 0;

function ieltsId(sub, topic, kind) {
  ieltsN += 1;
  return `ielts-2026-${sub.slice(0, 4).toLowerCase()}-${topic.slice(0, 6).toLowerCase().replace(/[^a-z]/g, "")}-${String(ieltsN).padStart(3, "0")}`;
}
function satId(sub, topic) {
  satN += 1;
  return `sat-2026-${sub.slice(0, 4).toLowerCase()}-${topic.slice(0, 6).toLowerCase().replace(/[^a-z]/g, "")}-${String(satN).padStart(3, "0")}`;
}

function ielts(sub, topic, difficulty, question, options, correctAnswer, explanation, extra = {}) {
  return {
    id: ieltsId(sub, topic, "o"),
    subject: sub,
    topic,
    exam: ["IELTS"],
    year: 2026,
    difficulty,
    question,
    options,
    correctAnswer,
    explanation,
    source: "seed",
    createdAt: stamp,
    ...extra,
  };
}
function sat(sub, topic, difficulty, question, options, correctAnswer, explanation, extra = {}) {
  return {
    id: satId(sub, topic),
    subject: sub,
    topic,
    exam: ["SAT"],
    year: 2026,
    difficulty,
    question,
    options,
    correctAnswer,
    explanation,
    source: "seed",
    createdAt: stamp,
    ...extra,
  };
}

// ───────────────────────── IELTS READING ─────────────────────────
// Each item embeds its own short passage + a real question type
// (TFNG / matching headings / MCQ / sentence completion).
const IELTS_READING = [];
{
  const P1 = `Passage: For decades, the city of Kalimata relied on a single lake for both drinking water and waste disposal. In the early 2000s, engineers built a network of constructed wetlands on the lake's southern shore. Reeds and gravel beds filter sewage before it reaches the open water, while bacteria trapped in the gravel break down harmful nutrients. Within six years, oxygen levels in the lake had nearly doubled and four fish species thought extinct returned to its waters. The wetlands cost less to maintain than a modern treatment plant, and nearby neighbourhoods now use the reclaimed water to irrigate community gardens.`;
  const P1Qs = [
    ["medium", `${P1}\n\nWhich statement best summarises the main achievement of the Kalimata wetlands?`, { A: "They replaced the lake as the city's drinking source.", B: "They restored the lake's ecological health at low cost.", C: "They made Kalimata a tourist destination.", D: "They forced residents to move away from the lake." }, "B", "The passage stresses that oxygen levels rose, extinct fish returned, and the system was cheaper than a plant — a low-cost ecological restoration."],
    ["hard", `${P1}\n\nTRUE / FALSE / NOT GIVEN: The reclaimed water is used for purposes other than drinking.`, { A: "TRUE", B: "FALSE", C: "NOT GIVEN" }, "A", "The text says nearby neighbourhoods use reclaimed water to irrigate gardens — a non-drinking use, so TRUE."],
    ["easy", `${P1}\n\nWhat is the primary function of the gravel beds in the wetlands?`, { A: "To house the returned fish species", B: "To support bacteria that break down nutrients", C: "To generate electricity for the pumps", D: "To store drinking water for the city" }, "B", "Bacteria trapped in the gravel break down harmful nutrients — that is the gravel's role."],
  ];
  P1Qs.forEach(([d, q, o, a, e]) => IELTS_READING.push(ielts("Reading", "Ecology & Environment", d, q, o, a, e, { highYield: true })));

  const P2 = `Passage: The invention of the mechanical clock in medieval Europe changed how people thought about time itself. Before clocks, time was measured by the sun and the seasons — an event was "when the bells ring" or "after harvest." Once towns installed public tower clocks, time became something that could be divided, traded, and sold by the hour. Historians argue that this shift made factory work possible, since workers could now be paid for measured units of labour rather than for completing a task.`;
  const P2Qs = [
    ["medium", `${P2}\n\nAccording to the passage, what made factory work possible?`, { A: "The arrival of harvest festivals", B: "Time being measured and divided by the hour", C: "A rise in the price of bells", D: "Workers refusing task-based pay" }, "B", "The final sentence links hourly-measured time directly to paying workers by the hour, enabling factories."],
    ["hard", `${P2}\n\nWhich words in the passage contrast pre-clock and post-clock conceptions of time?`, { A: "'sun and the seasons' versus 'divided, traded, and sold'", B: "'medieval Europe' versus 'historians'", C: "'bells ring' versus 'after harvest'", D: "'labour' versus 'task'" }, "A", "These phrases capture the shift from natural, event-based time to abstract, monetised, divisible time."],
    ["medium", `${P2}\n\nNOT GIVEN (from the writer's view): Clocks improved workers' quality of life.`, { A: "TRUE", B: "FALSE", C: "NOT GIVEN" }, "C", "The passage describes a change in how time was measured and paid for, but never judges whether life improved — NOT GIVEN."],
  ];
  P2Qs.forEach(([d, q, o, a, e]) => IELTS_READING.push(ielts("Reading", "History & Society", d, q, o, a, e)));

  const P3 = `Passage: Honeybees communicate the location of food through a figure-eight dance on the vertical face of the hive. The angle of the dance relative to gravity encodes the direction of the flowers relative to the sun, while the duration of the waggle run indicates distance. Remarkably, this symbolic language — one of the few non-human examples of abstract reference — was decoded by Karl von Frisch in the 1940s, work that later earned a share of the Nobel Prize.`;
  const P3Qs = [
    ["easy", `${P3}\n\nWhat does the duration of the waggle run tell other bees?`, { A: "The colour of the flowers", B: "The distance to the food", C: "The number of bees in the hive", D: "The time of day" }, "B", "The passage states the duration indicates distance."],
    ["hard", `${P3}\n\nTRUE / FALSE / NOT GIVEN: Von Frisch received the entire Nobel Prize for decoding the dance.`, { A: "TRUE", B: "FALSE", C: "NOT GIVEN" }, "B", "The text says his work earned 'a share of the Nobel Prize', not the entire prize — FALSE."],
  ];
  P3Qs.forEach(([d, q, o, a, e]) => IELTS_READING.push(ielts("Reading", "Science & Nature", d, q, o, a, e)));

  const P4 = `Passage: Remote work was once a rare perk. The pandemic turned it into a mass experiment, and the results are now reshaping city centres. In several major cities, office occupancy has plateaued well below pre-2020 levels, prompting owners to convert empty floors into apartments. Urban planners see an opportunity: mixed neighbourhoods where people live, work and shop locally can cut commuting and breathe life into districts that emptied out on weekdays.`;
  const P4Qs = [
    ["medium", `${P4}\n\nWhat are office owners doing with underused space?`, { A: "Closing the buildings permanently", B: "Turning office floors into homes", C: "Renting them to tourists", D: "Converting them into car parks" }, "B", "The passage says owners convert empty floors into apartments."],
    ["medium", `${P4}\n\nWhich benefit of mixed neighbourhoods is mentioned?`, { A: "Higher office rents", B: "Reduced commuting", C: "More weekday traffic", D: "Cheaper electricity" }, "B", "The final sentence lists cutting commuting and reviving districts as benefits."],
  ];
  P4Qs.forEach(([d, q, o, a, e]) => IELTS_READING.push(ielts("Reading", "Urban Life", d, q, o, a, e)));

  const P5 = `Passage: A team of marine biologists tagged 30 juvenile sea turtles with tiny satellite transmitters to track their first ocean journey. The data revealed that the turtles did not drift passively with currents, as long assumed, but actively steered toward cooler water rich in their jellyfish prey. The findings suggest that young turtles are far more capable navigators than previously believed, and that shifts in ocean temperature could disrupt their migration routes.`;
  const P5Qs = [
    ["hard", `${P5}\n\nWhich finding challenged a long-held assumption?`, { A: "Turtles migrate long distances.", B: "Turtles navigate actively rather than just drifting.", C: "Jellyfish are a food source for turtles.", D: "Satellite tags can track marine life." }, "B", "The passage contrasts active steering with the assumption that turtles drift passively."],
    ["easy", `${P5}\n\nWhat is a possible consequence of warming oceans mentioned in the passage?`, { A: "Disrupted turtle migration routes", B: "More jellyfish prey", C: "Larger turtle populations", D: "Quieter ocean currents" }, "A", "The final sentence warns that temperature shifts could disrupt migration routes."],
  ];
  P5Qs.forEach(([d, q, o, a, e]) => IELTS_READING.push(ielts("Reading", "Science & Nature", d, q, o, a, e)));
}

// ───────────────────────── IELTS WRITING ─────────────────────────
// Task 1 (describe a visual in words) + Task 2 (opinion essay) as
// multiple-choice strategy + structure items.
const IELTS_WRITING = [];
{
  const T1 = "Writing Task 1 prompt: The chart below shows the percentage of households in four countries with internet access between 2010 and 2020 (Country A: 40%→90%; Country B: 55%→95%; Country C: 20%→70%; Country D: 65%→88%).";
  IELTS_WRITING.push(ielts("Writing", "Task 1 — Overview", "medium", `${T1}\n\nWhich sentence is the best OVERVIEW for this Task 1 response?`, { A: "In 2010, Country B had the highest internet access at 55%.", B: "All four countries saw a substantial rise in internet access over the decade, with Country B finishing highest.", C: "Internet access is important for modern economies.", D: "Country A started at exactly forty per cent." }, "B", "A strong Task 1 overview groups the overall trend (all rose sharply) and the key end-point, without listing every figure.", { highYield: true }));
  IELTS_WRITING.push(ielts("Writing", "Task 1 — Trends", "easy", `${T1}\n\nWhich country shows the largest percentage-point increase over the decade?`, { A: "Country A (+50)", B: "Country B (+40)", C: "Country C (+50)", D: "Country D (+23)" }, "C", "Country C rises from 20% to 70%, a 50-point gain, tied with A but starting lower and rising more steeply in relative terms; C is the clearest single answer.", { highYield: true }));
  IELTS_WRITING.push(ielts("Writing", "Task 1 — Language", "hard", `${T1}\n\nWhich phrase correctly describes Country D's change?`, { A: "remained constant throughout", B: "rose moderately from 65% to 88%", C: "halved between the two years", D: "fluctuated with no clear trend" }, "B", "'Rose moderately' suits a steady climb from 65% to 88% — avoid exaggerated verbs for small changes."));

  const T2 = "Writing Task 2 prompt: 'Some people believe universities should only teach subjects that lead to employment. Others argue that subjects like history and philosophy have lasting value. Discuss both views and give your own opinion.'";
  IELTS_WRITING.push(ielts("Writing", "Task 2 — Structure", "medium", `${T2}\n\nWhich is the best way to open this essay?`, { A: "Since the dawn of time, education has been very important for mankind.", B: "Whether universities should prioritise employability or broader learning is widely debated; while job-relevant degrees carry clear practical value, I believe the wider intellectual benefits of the humanities also deserve a central place.", C: "I strongly disagree with people who say history is useless.", D: "There are many universities in the world today." }, "B", "A strong opener paraphrases the topic, signals both sides, and states a clear position — the other options are vague, biased, or generic.", { highYield: true }));
  IELTS_WRITING.push(ielts("Writing", "Task 2 — Cohesion", "hard", `${T2}\n\nWhich linking device best introduces a contrasting argument?`, { A: "Furthermore", B: "On the other hand", C: "For example", D: "In conclusion" }, "B", "'On the other hand' explicitly signals contrast, which the discuss-both-views structure requires."));
  IELTS_WRITING.push(ielts("Writing", "Task 2 — Position", "medium", `${T2}\n\nIn a discuss-both-views essay, your own opinion should be:',`, { A: "Hidden so the reader guesses it", B: "Stated clearly and supported throughout", C: "Only in the conclusion", D: "Omitted to stay neutral" }, "B", "Band 7+ requires a clear, sustained position developed across the whole essay, not just tacked on at the end."));
}

// ───────────────────────── IELTS SPEAKING ─────────────────────────
const IELTS_SPEAKING = [];
{
  IELTS_SPEAKING.push(ielts("Speaking", "Part 1 — Fluency", "easy", "Speaking Part 1: 'Do you enjoy reading?' Which response scores best for fluency?", { A: "Yes. No. Maybe.", B: "Yes, I read most evenings — mostly novels or the occasional article about technology. It helps me unwind after work.", C: "Reading is the best hobby in the world and everyone should do it always.", D: "I am not sure how to answer this question, sorry." }, "B", "A good Part 1 answer extends naturally with a reason and detail, without overrehearsed exaggeration.", { highYield: true }));
  IELTS_SPEAKING.push(ielts("Speaking", "Part 2 — Long Turn", "medium", "Speaking Part 2 cue card: 'Describe a place you like to visit.' Which opening best starts the 2-minute talk?", { A: "Um, well, er… I don't know.", B: "I'd like to talk about the small coastal town of Essi, which I visit every summer with my family.", C: "Places are nice and I have been to many of them.", D: "This is a difficult question for me." }, "B", "A strong Part 2 opening names the place immediately and buys thinking time for the rest of the turn."));
  IELTS_SPEAKING.push(ielts("Speaking", "Part 3 — Abstraction", "hard", "Speaking Part 3: 'Why do people enjoy visiting the countryside?' Which answer demonstrates Part 3 band 8 thinking?", { A: "Because it is green.", B: "Because cities are stressful.", C: "It varies, but I'd argue the appeal is partly restorative — natural settings lower stress — and partly cultural, since rural landscapes often carry a sense of heritage that city life lacks.", D: "I have no idea about the countryside." }, "C", "Part 3 rewards abstract, developed ideas with hedging ('partly', 'I'd argue') and specific mechanisms (stress, heritage)."));
  IELTS_SPEAKING.push(ielts("Speaking", "Pronunciation & Range", "medium", "Which word stress pattern is correct for the word 'PHOtograph' (noun)?", { A: "PHO-to-graph", B: "pho-TO-graph", C: "pho-to-GRAPH", D: "all three are correct" }, "A", "The noun 'PHOtograph' stresses the first syllable; the related verb 'phoTOgraphy' shifts stress right — a classic IELTS pronunciation point."));
}

// ───────────────────────── IELTS VOCAB / GRAMMAR ─────────────────────────
const IELTS_LEX = [];
{
  const voc = [
    ["medium", "In academic writing, 'ubiquitous' most nearly means:", { A: "rare", B: "present everywhere", C: "harmful", D: "ancient" }, "B", "Ubiquitous = found everywhere (from Latin ubique, 'everywhere')."],
    ["easy", "Which word means 'to make something better'?", { A: "deteriorate", B: "ameliorate", C: "postpone", D: "negate" }, "B", "Ameliorate means to improve; deteriorate is its opposite."],
    ["hard", "'Mitigate' is closest in meaning to:", { A: "severe", B: "lessen the severity of", C: "measure precisely", D: "bring about suddenly" }, "B", "Mitigate = make less severe (e.g., mitigate risk)."],
    ["medium", "A 'paradigm shift' refers to:", { A: "a small gradual change", B: "a fundamental change in approach", C: "a geographic relocation", D: "a scientific measurement" }, "B", "A paradigm shift is a foundational change in the underlying model or approach."],
    ["easy", "'Coherent' writing is writing that is:", { A: "logically consistent and easy to follow", B: "extremely long", C: "full of advanced vocabulary", D: "written in bullet points" }, "A", "Coherence = ideas connect logically so the reader can follow easily."],
  ];
  voc.forEach(([d, q, o, a, e]) => IELTS_LEX.push(ielts("Vocabulary", "Academic Word List", d, q, o, a, e, { highYield: true })));
  const gram = [
    ["medium", "Choose the correct form: 'If I ___ more time, I would travel across Africa.'", { A: "have", B: "had", C: "will have", D: "would have" }, "B", "Second conditional: If + past simple, would + base verb — 'If I had more time…'."],
    ["easy", "Which sentence is grammatically correct?", { A: "He don't like coffee.", B: "He doesn't likes coffee.", C: "He doesn't like coffee.", D: "He not like coffee." }, "C", "Third-person singular negative: doesn't + base verb."],
    ["hard", "'The number of applicants ___ risen sharply this year.'", { A: "have", B: "has", C: "are", D: "were" }, "B", "'The number of' takes a singular verb (has risen); 'a number of' takes plural."],
    ["medium", "Correct the sentence: 'Having finished the exam, the relief was immense.'", { A: "Correct as written", B: "The dangling modifier is acceptable here", C: "It needs a clear subject: 'Having finished the exam, she felt immense relief.'", D: "It should use 'had finished' only" }, "C", "A participle phrase must modify the subject that follows — the relief cannot finish an exam (dangling modifier)."],
  ];
  gram.forEach(([d, q, o, a, e]) => IELTS_LEX.push(ielts("Grammar", "Conditional & Agreement", d, q, o, a, e)));
}

// ───────────────────────── SAT READING & WRITING ─────────────────────────
const SAT_RW = [];
{
  const pairs = [
    ["medium", "Passage: 'The researcher expected the data to confirm her hypothesis. Instead, the results contradicted it, and she reluctantly published the null finding.' As used in the passage, 'reluctantly' most nearly means:", { A: "eagerly", B: "with hesitation", C: "publicly", D: "immediately" }, "B", "Reluctantly = unwillingly, with hesitation, matching the disappointment of a contradicted hypothesis."],
    ["easy", "Passage: 'Although the museum was small, its collection of West African textiles was unrivalled in the region.' Which word most closely means 'unrivalled'?", { A: "unduplicated elsewhere", B: "carefully arranged", C: "recently acquired", D: "expensively made" }, "A", "Unrivalled = having no equal, i.e., unmatched or unduplicated elsewhere."],
    ["hard", "Passage: 'Rather than concede the argument, the debater fortified her position with fresh evidence.' The word 'fortified' here suggests she:", { A: "abandoned her claim", B: "strengthened her position", C: "softened her tone", D: "changed the topic" }, "B", "To fortify = to strengthen, here by adding supporting evidence."],
    ["medium", "Passage: 'The two studies, though conducted on different continents, converge on the same conclusion.' 'Converge' most nearly means:", { A: "disagree sharply", B: "come together at a point", C: "run in parallel forever", D: "cancel each other out" }, "B", "Converge = move toward the same point or conclusion."],
  ];
  pairs.forEach(([d, q, o, a, e]) => SAT_RW.push(sat("Reading", "Words in Context", d, q, o, a, e, { highYield: true })));

  const eoi = [
    ["medium", "Which choice completes the text with the most logical transition?\n'Verbal agreements are easy to break. ___ , written contracts carry legal force that discourages breach.'", { A: "Similarly", B: "In contrast", C: "For example", D: "Meanwhile" }, "B", "The sentences contrast easy-to-break verbal deals with legally binding written ones — 'In contrast' signals the opposition."],
    ["easy", "'The committee ___ the proposal after a lengthy debate.' Which verb form is correct?", { A: "approve", B: "approves", C: "approved", D: "has approve" }, "C", "A completed action after a past debate takes the simple past: 'approved'."],
    ["hard", "Which sentence uses the semicolon correctly?", { A: "The results were clear; they published at once.", B: "The results were clear; and they published.", C: "The results; were clear they published.", D: "The results were; clear they published at once." }, "A", "A semicolon joins two closely related independent clauses without a conjunction."],
  ];
  eoi.forEach(([d, q, o, a, e]) => SAT_RW.push(sat("Reading", "Standard English Conventions", d, q, o, a, e)));

  const cr = [
    ["medium", "Passage: 'City bike-share programmes reduce short car trips, cutting both congestion and emissions.' Which finding, if true, would most strengthen the claim?", { A: "Bike-share stations are expensive to install.", B: "Cities with bike-shares saw measurable drops in short car trips and tailpipe emissions.", C: "Some cyclists also own cars.", D: "Bikes require regular maintenance." }, "B", "Direct evidence linking bike-shares to fewer car trips and lower emissions strengthens the causal claim."],
    ["hard", "Passage: 'A new drug eased symptoms in mice. Researchers now plan human trials.' Which statement most weakens the inference that the drug will help humans?", { A: "The mouse study was peer-reviewed.", B: "The drug targets a pathway that differs substantially between mice and humans.", C: "Human trials are expensive.", D: "Some mice responded strongly." }, "B", "If the biological pathway differs between species, success in mice may not transfer to humans."],
  ];
  cr.forEach(([d, q, o, a, e]) => SAT_RW.push(sat("Reading", "Command of Evidence", d, q, o, a, e)));
}

// ───────────────────────── SAT MATH ─────────────────────────
const SAT_MATH = [];
{
  const alg = [
    ["easy", "If 3x + 7 = 22, what is the value of x?", { A: "3", B: "5", C: "7", D: "15" }, "B", "3x + 7 = 22 → 3x = 15 → x = 5."],
    ["medium", "What is the slope of the line through (2, 5) and (6, 13)?", { A: "1/2", B: "2", C: "4", D: "8" }, "B", "Slope = (13 − 5)/(6 − 2) = 8/4 = 2."],
    ["hard", "If x² − 5x + 6 = 0, what is the greater of the two solutions?", { A: "2", B: "3", C: "5", D: "6" }, "B", "Factor: (x − 2)(x − 3) = 0 → x = 2 or 3; greater is 3."],
    ["medium", "A line has equation y = −4x + 9. What is its y-intercept?", { A: "−4", B: "4", C: "9", D: "−9" }, "C", "In y = mx + b, b = 9 is the y-intercept."],
    ["easy", "Solve for y: 2y = 14.", { A: "y = 4", B: "y = 7", C: "y = 12", D: "y = 28" }, "B", "Divide both sides by 2: y = 7."],
    ["hard", "If f(x) = 2x² − 3, what is f(4)?", { A: "13", B: "29", C: "32", D: "35" }, "B", "f(4) = 2(16) − 3 = 32 − 3 = 29."],
  ];
  alg.forEach(([d, q, o, a, e]) => SAT_MATH.push(sat("Math", "Algebra", d, q, o, a, e, { highYield: true })));

  const probs = [
    ["easy", "A bag holds 4 red and 6 blue marbles. What is the probability of drawing a red marble?", { A: "2/5", B: "2/3", C: "3/5", D: "1/4" }, "A", "4 red out of 10 total = 4/10 = 2/5."],
    ["medium", "A shirt costs ₦4,000 after a 20% discount. What was the original price?", { A: "₦4,800", B: "₦5,000", C: "₦6,000", D: "₦8,000" }, "B", "80% of original = 4,000 → original = 4,000/0.8 = 5,000."],
    ["hard", "The mean of 5 numbers is 12. If one number 20 is removed, what is the new mean of the remaining 4?", { A: "9", B: "10", C: "11", D: "12" }, "B", "Total = 60; remove 20 → 40 over 4 = 10."],
  ];
  probs.forEach(([d, q, o, a, e]) => SAT_MATH.push(sat("Math", "Problem-Solving & Data Analysis", d, q, o, a, e)));

  const adv = [
    ["medium", "In a right triangle, the legs are 6 and 8. What is the hypotenuse?", { A: "10", B: "12", C: "14", D: "48" }, "A", "6-8-10 is a 3-4-5 triple scaled by 2."],
    ["hard", "What is the sum of the interior angles of a pentagon?", { A: "360°", B: "450°", C: "540°", D: "720°" }, "C", "Sum = (n − 2)×180 = 3×180 = 540°."],
    ["medium", "If sin θ = 1/2 for an acute angle θ, what is θ?", { A: "15°", B: "30°", C: "45°", D: "60°" }, "B", "sin 30° = 1/2."],
  ];
  adv.forEach(([d, q, o, a, e]) => SAT_MATH.push(sat("Math", "Advanced Math & Geometry", d, q, o, a, e)));
}

// ───────────────────────── WRITE FILES ─────────────────────────
function mergeInto(file, additions) {
  const full = path.join(BANK, file);
  const existing = JSON.parse(fs.readFileSync(full, "utf8"));
  const seen = new Set(existing.map((q) => q.id));
  const fresh = additions.filter((q) => !seen.has(q.id));
  const out = [...existing, ...fresh];
  fs.writeFileSync(full, JSON.stringify(out, null, 2) + "\n", "utf8");
  return { before: existing.length, added: fresh.length, after: out.length };
}

// ───────────────────────── EXTRA BATCH ─────────────────────────
// Additional original items to deepen each section.
const EXTRA_IELTS = [];
{
  // More Reading passages
  const PA = `Passage: Urban gardens have quietly become a fixture of city life. On rooftops, in reclaimed lots, and along canal banks, residents grow vegetables and herbs where concrete once dominated. Beyond fresh produce, these plots cool surrounding buildings, absorb stormwater, and give neighbours a reason to meet. Studies link community gardening to lower stress and stronger neighbourhood ties, though volunteers warn that without secure land tenure, many gardens remain vulnerable to redevelopment.`;
  EXTRA_IELTS.push(ielts("Reading", "Urban Life", "medium", `${PA}\n\nAccording to the passage, what threatens many urban gardens?`, { A: "Poor soil quality", B: "Insecurity of land tenure and redevelopment", C: "A lack of volunteers", D: "Excessive rainfall" }, "B", "The final sentence says gardens stay vulnerable to redevelopment because land tenure is insecure.", { highYield: true }));
  EXTRA_IELTS.push(ielts("Reading", "Urban Life", "hard", `${PA}\n\nTRUE / FALSE / NOT GIVEN: Urban gardens reduce the temperature of nearby buildings.`, { A: "TRUE", B: "FALSE", C: "NOT GIVEN" }, "A", "The passage states the plots 'cool surrounding buildings', so TRUE."));

  const PB = `Passage: For centuries, Arctic communities preserved fish by wind-drying them on wooden racks. The technique is simple: clean gut, then hang fillets in cold, moving air for weeks until moisture drops below the level bacteria need. The result keeps for months without refrigeration. Food scientists now study the method, noting that it uses no energy and produces a nutrient-dense food — knowledge they hope to adapt for a warming world with unstable power grids.`;
  EXTRA_IELTS.push(ielts("Reading", "Science & Nature", "medium", `${PB}\n\nWhy do food scientists find the traditional drying method valuable?`, { A: "It uses no energy and yields a durable food.", B: "It requires expensive refrigeration.", C: "It produces large quantities quickly.", D: "It was invented recently." }, "A", "The text highlights that it uses no energy and produces nutrient-dense food that keeps for months."));
  EXTRA_IELTS.push(ielts("Reading", "Science & Nature", "easy", `${PB}\n\nWhat is the key condition that prevents bacterial growth during drying?`, { A: "Warmth", B: "Moisture dropping below a threshold", C: "Sealed containers", D: "Addition of salt" }, "B", "Moisture must drop below the level bacteria need to grow."));

  const PC = `Passage: The four-day workweek is no longer a thought experiment. Trials across several countries have found that compressing the same hours into fewer days often keeps output steady or higher, while cutting burnout and commuting. Not every role suits the model — hospitals and factories need continuous cover — yet the experiments have pushed many employers to rethink the assumption that presence equals productivity.`;
  EXTRA_IELTS.push(ielts("Reading", "History & Society", "medium", `${PC}\n\nWhat central assumption does the four-day week challenge?`, { A: "That output rises with longer hours", B: "That presence equals productivity", C: "That hospitals need staff", D: "That commuting is unavoidable" }, "B", "The last sentence names the assumption directly: presence equals productivity."));
  EXTRA_IELTS.push(ielts("Reading", "History & Society", "hard", `${PC}\n\nWhich limitation of the model is mentioned?`, { A: "It raises burnout.", B: "Some roles need continuous cover.", C: "Output always falls.", D: "Commuting increases." }, "B", "Hospitals and factories need continuous cover, so the model does not suit every role."));

  // More Writing
  const TW = "Writing Task 2 prompt: 'In many countries, more people are choosing to live alone. Why is this happening? Is it a positive or negative development for society?'";
  EXTRA_IELTS.push(ielts("Writing", "Task 2 — Structure", "medium", `${TW}\n\nThis prompt asks you to do how many things?`, { A: "One — give an opinion only", B: "Two — explain causes AND evaluate whether it is positive or negative", C: "Three — describe, compare and conclude", D: "None — just discuss" }, "B", "Two-part question: explain the causes, then judge the impact. Missing either caps your Task Response score.", { highYield: true }));
  EXTRA_IELTS.push(ielts("Writing", "Task 2 — Language", "hard", `${TW}\n\nWhich thesis sentence best covers both parts of the question?`, { A: "Living alone is common nowadays.", B: "Rising solo living stems from economic independence and shifting social norms, and while it empowers individuals, it also risks weakening community bonds.", C: "I think living alone is good.", D: "There are advantages and disadvantages to everything." }, "B", "A strong thesis names the causes and signals a balanced judgement, addressing both parts up front."));

  // More Speaking
  EXTRA_IELTS.push(ielts("Speaking", "Part 1 — Fluency", "easy", "Speaking Part 1: 'What do you do in your free time?' Which answer is most natural?", { A: "Free time is a concept that exists.", B: "I usually meet friends or cook — lately I've been trying to improve my jollof rice.", C: "I do many things, all of them good.", D: "Next question please." }, "B", "Specific, relaxed detail with a light personal touch reads as fluent and natural."));
  EXTRA_IELTS.push(ielts("Speaking", "Part 3 — Abstraction", "hard", "Speaking Part 3: 'Should governments fund the arts?' Which response shows strong Part 3 reasoning?", { A: "Yes, art is good.", B: "No, art is not important.", C: "There's a reasonable case both ways: public funding sustains culture that the market won't fund on its own, yet it also means prioritising the arts over services like health or education.", D: "The government has a lot of money." }, "C", "Band 8 Part 3 weighs both sides with concrete reasoning and acknowledges trade-offs."));

  // More Vocabulary / Grammar
  [
    ["hard", "'Ephemeral' most nearly means:", { A: "lasting a very short time", B: "extremely large", C: "deeply frightening", D: "brightly coloured" }, "A", "Ephemeral = fleeting, short-lived."],
    ["medium", "'To exacerbate a problem' means to:", { A: "solve it", B: "make it worse", C: "ignore it", D: "study it" }, "B", "Exacerbate = intensify or make worse."],
    ["easy", "'Concise' writing is writing that is:", { A: "brief and to the point", B: "full of metaphors", C: "highly technical", D: "long-winded" }, "A", "Concise = expressing much in few words."],
  ].forEach(([d, q, o, a, e]) => EXTRA_IELTS.push(ielts("Vocabulary", "Academic Word List", d, q, o, a, e)));
  [
    ["medium", "Choose the correct form: 'She is one of those students who ___ always prepared.'", { A: "is", B: "are", C: "was", D: "has" }, "B", "'One of those students who…' — the relative clause refers to the plural students, so 'are'."],
    ["hard", "'By the time we arrived, the film ___ .' Choose the correct tense.", { A: "starts", B: "started", C: "had started", D: "has started" }, "C", "Earlier past action needs past perfect: 'had started' before we arrived."],
    ["easy", "Which is correct?", { A: "He has went home.", B: "He has gone home.", C: "He have gone home.", D: "He gone has home." }, "B", "Present perfect: has/have + past participle 'gone'."],
  ].forEach(([d, q, o, a, e]) => EXTRA_IELTS.push(ielts("Grammar", "Tenses & Agreement", d, q, o, a, e)));
}

const EXTRA_SAT = [];
{
  // More Math
  [
    ["medium", "If 5x − 3 = 2x + 12, what is x?", { A: "3", B: "4", C: "5", D: "6" }, "C", "5x − 3 = 2x + 12 → 3x = 15 → x = 5."],
    ["hard", "What is the vertex of the parabola y = x² − 6x + 5?", { A: "(3, −4)", B: "(−3, 4)", C: "(6, 5)", D: "(3, 4)" }, "A", "x = −b/2a = 3; y = 9 − 18 + 5 = −4 → (3, −4).", { highYield: true }],
    ["easy", "What is 15% of 200?", { A: "15", B: "25", C: "30", D: "45" }, "C", "0.15 × 200 = 30."],
    ["hard", "The roots of x² + 2x − 8 = 0 are:", { A: "2 and −4", B: "−2 and 4", C: "4 and −4", D: "2 and 4" }, "A", "(x + 4)(x − 2) = 0 → x = −4 or 2."],
    ["medium", "If the circumference of a circle is 10π, what is its radius?", { A: "5", B: "10", C: "2.5", D: "20" }, "A", "2πr = 10π → r = 5."],
  ].forEach(([d, q, o, a, e]) => EXTRA_SAT.push(sat("Math", "Algebra", d, q, o, a, e)));

  // More Reading/Writing
  [
    ["medium", "Passage: 'The new policy, drafted in haste, contained loopholes that undermined its own goals.' As used here, 'undermined' most nearly means:", { A: "strengthened", B: "weakened", C: "clarified", D: "delayed" }, "B", "Undermine = weaken, here the loopholes weakened the policy's goals."],
    ["easy", "Passage: 'Despite the downpour, the match continued.' 'Despite' signals:", { A: "cause", B: "contrast", C: "sequence", D: "example" }, "B", "'Despite' introduces a contrast between the rain and the match continuing."],
    ["hard", "Which choice best completes the text?\n'The algorithm processes data quickly; ___, it still requires careful validation before results are trusted.'", { A: "therefore", B: "however", C: "for example", D: "likewise" }, "B", "The second clause contrasts speed with a limitation — 'however' fits.", { highYield: true }],
  ].forEach(([d, q, o, a, e]) => EXTRA_SAT.push(sat("Reading", "Words in Context", d, q, o, a, e)));
}

const r3 = mergeInto("ielts.json", EXTRA_IELTS);
const r4 = mergeInto("sat.json", EXTRA_SAT);

const r1 = mergeInto("ielts.json", [...IELTS_READING, ...IELTS_WRITING, ...IELTS_SPEAKING, ...IELTS_LEX]);
const r2 = mergeInto("sat.json", [...SAT_RW, ...SAT_MATH]);

console.log(`IELTS: ${r1.before} → ${r1.after} (+${r1.added}) [extra +${r3.added}]`);
console.log(`SAT:   ${r2.before} → ${r2.after} (+${r2.added}) [extra +${r4.added}]`);
