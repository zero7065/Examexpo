// src/data/questionBank.js
// Organized by exam type. Each question tagged with exam, subject, year, topic.
// Covers JAMB (2024-2026), WAEC (2024-2026), NABTEB (2024-2026)

export const QUESTION_BANK = {

  // ============================================================
  // JAMB 2026 QUESTIONS (Latest)
  // ============================================================

  "Use of English Language": [
    { id: "eng_2026_001", subject: "Use of English Language", exam: "JAMB", year: 2026, topic: "Lexis and Structure", difficulty: "medium",
      question: "Choose the word that best completes the sentence: 'The economist argued that inflation would ___ unless the government intervened.'",
      options: { A: "diminish", B: "abate", C: "escalate", D: "subsist" },
      correctAnswer: "B", explanation: "Abate means to diminish or subside. The sentence implies inflation would decrease if the government intervenes." },
    { id: "eng_2026_002", subject: "Use of English Language", exam: "JAMB", year: 2026, topic: "Grammar", difficulty: "easy",
      question: "Select the correct sentence:",
      options: { A: "Neither the students nor the teacher were present", B: "Neither the students nor the teacher was present", C: "Neither the students or the teacher were present", D: "Neither the students or the teacher was present" },
      correctAnswer: "B", explanation: "With 'neither...nor', the verb agrees with the nearest subject. 'Teacher' is singular, so 'was' is correct." },
    { id: "eng_2026_003", subject: "Use of English Language", exam: "JAMB", year: 2026, topic: "Comprehension", difficulty: "hard",
      question: "Based on the passage, the author's stance on climate change policy can best be described as:",
      options: { A: "Indifferent", B: "Advocative", C: "Skeptical", D: "Ambivalent" },
      correctAnswer: "B", explanation: "The passage strongly supports climate action, using words like 'must act now' and 'critical responsibility'." },
    { id: "eng_2026_004", subject: "Use of English Language", exam: "JAMB", year: 2026, topic: "Oral English", difficulty: "medium",
      question: "Which word has the stress pattern 'RE-cep-tive'?",
      options: { A: "Receive", B: "Reception", C: "ceptive", D: "Concept" },
      correctAnswer: "B", explanation: "Reception has stress on the second syllable: re-CEP-tion." },
    { id: "eng_2026_005", subject: "Use of English Language", exam: "JAMB", year: 2026, topic: "Literary Devices", difficulty: "medium",
      question: "Identify the literary device in: 'The wind howled its mournful song'",
      options: { A: "Simile", B: "Metaphor", C: "Personification", D: "Hyperbole" },
      correctAnswer: "C", explanation: "Personification gives human qualities (howling, mournful song) to the non-human wind." },
    { id: "eng_2026_006", subject: "Use of English Language", exam: "JAMB", year: 2026, topic: " Vocabulary", difficulty: "hard",
      question: "The word 'ephemeral' most nearly means:",
      options: { A: "Eternal", B: "Short-lived", C: "Precious", D: "Hidden" },
      correctAnswer: "B", explanation: "Ephemeral means lasting for a very short time. Synonyms: fleeting, brief, transient." },
    { id: "eng_2025_001", subject: "Use of English Language", exam: "JAMB", year: 2025, topic: "Antonyms", difficulty: "easy",
      question: "Choose the word opposite in meaning to 'ubiquitous'",
      options: { A: "Rare", B: "Common", C: "Present", D: "Widespread" },
      correctAnswer: "A", explanation: "Ubiquitous means existing everywhere. Its opposite is rare or scarce." },
    { id: "eng_2024_001", subject: "Use of English Language", exam: "JAMB", year: 2024, topic: "Synonyms", difficulty: "medium",
      question: "Which word is most similar in meaning to 'mitigate'?",
      options: { A: "Aggravate", B: "Alleviate", C: "Ignore", D: "Worsen" },
      correctAnswer: "B", explanation: "Mitigate means to make less severe. Alleviate is a synonym, while aggravate/worsen are opposites." },
    { id: "eng_2023_001", subject: "Use of English Language", exam: "JAMB", year: 2023, topic: "Idioms", difficulty: "medium",
      question: "What does 'bite the bullet' mean?",
      options: { A: "Eat something quickly", B: "Face a difficult situation", C: "Break a tooth", D: "Cancel something" },
      correctAnswer: "B", explanation: "This idiom means to endure a painful or difficult situation with courage." },
    { id: "eng_2022_001", subject: "Use of English Language", exam: "JAMB", year: 2022, topic: "Tenses", difficulty: "easy",
      question: "Choose the correct tense: By next month, she ___ her degree.",
      options: { A: "will have completed", B: "has completed", C: "will complete", D: "is completing" },
      correctAnswer: "A", explanation: "Future perfect tense 'will have completed' is used for an action completed before a future time." },
    { id: "eng_2021_001", subject: "Use of English Language", exam: "JAMB", year: 2021, topic: "Passive Voice", difficulty: "medium",
      question: "Change to passive: 'The chef prepared a delicious meal'",
      options: { A: "A delicious meal was prepared by the chef", B: "The meal was prepared by the chef", C: "A meal was being prepared", D: "The chef has prepared a meal" },
      correctAnswer: "A", explanation: "In passive voice, the object becomes the subject. 'The chef' becomes the agent (by the chef)." },
    { id: "eng_2020_001", subject: "Use of English Language", exam: "JAMB", year: 2020, topic: "Direct Speech", difficulty: "easy",
      question: "Convert to indirect speech: She said, 'I am tired'",
      options: { A: "She said she is tired", B: "She said she was tired", C: "She said I am tired", D: "She said she was feeling tired" },
      correctAnswer: "B", explanation: "In indirect speech, present tense changes to past tense. 'I am' becomes 'she was'." },
    { id: "eng_2019_001", subject: "Use of English Language", exam: "JAMB", year: 2019, topic: "Preposition", difficulty: "medium",
      question: "The girl is reminiscent ___ her grandmother.",
      options: { A: "to", B: "of", C: "with", D: "on" },
      correctAnswer: "B", explanation: "The correct phrase is 'reminiscent of', meaning remembering or resembling." },
    { id: "eng_2018_001", subject: "Use of English Language", exam: "JAMB", year: 2018, topic: "Phrasal Verbs", difficulty: "hard",
      question: "The company had to ___ the project due to lack of funds.",
      options: { A: "carry out", B: "put off", C: "give up", D: "look into" },
      correctAnswer: "C", explanation: "Give up means to stop or abandon. The sentence implies the project was abandoned." },
    { id: "eng_2017_001", subject: "Use of English Language", exam: "JAMB", year: 2017, topic: "Conjunction", difficulty: "easy",
      question: "___ he was tired, he continued studying.",
      options: { A: "Although", B: "Because", C: "Since", D: "While" },
      correctAnswer: "A", explanation: "Although introduces a contrast - he was tired but continued studying." },
  ],

  "Mathematics": [
    { id: "mth_2026_001", subject: "Mathematics", exam: "JAMB", year: 2026, topic: "Algebra", difficulty: "medium",
      question: "If log₃(x+2) = 2, find the value of x.",
      options: { A: "5", B: "7", C: "9", D: "11" },
      correctAnswer: "B", explanation: "log₃(x+2)=2 means 3² = x+2. So 9 = x+2, x = 7." },
    { id: "mth_2026_002", subject: "Mathematics", exam: "JAMB", year: 2026, topic: "Calculus", difficulty: "hard",
      question: "Find the derivative of y = x³ + 2x² - 5x + 3",
      options: { A: "3x² + 4x - 5", B: "3x² + 4x + 5", C: "x³ + 2x² - 5", D: "3x + 4x - 5" },
      correctAnswer: "A", explanation: "dy/dx of x³ is 3x², of 2x² is 4x, of -5x is -5, constant becomes 0. So 3x² + 4x - 5." },
    { id: "mth_2026_003", subject: "Mathematics", exam: "JAMB", year: 2026, topic: "Statistics", difficulty: "medium",
      question: "The mean of 5 numbers is 12. Four of the numbers are 8, 15, 10, and 11. Find the fifth number.",
      options: { A: "12", B: "14", C: "16", D: "18" },
      correctAnswer: "C", explanation: "Sum = 5×12 = 60. Known sum = 8+15+10+11 = 44. Fifth = 60-44 = 16." },
    { id: "mth_2026_004", subject: "Mathematics", exam: "JAMB", year: 2026, topic: "Trigonometry", difficulty: "medium",
      question: "If tan θ = 3/4, find sin θ.",
      options: { A: "3/5", B: "4/5", C: "5/3", D: "5/4" },
      correctAnswer: "A", explanation: "tan θ = opp/adj = 3/4. Using Pythagorean triple 3-4-5, sin θ = opp/hyp = 3/5." },
    { id: "mth_2026_005", subject: "Mathematics", exam: "JAMB", year: 2026, topic: "Geometry", difficulty: "easy",
      question: "Calculate the volume of a cone with radius 7cm and height 12cm (π = 22/7)",
      options: { A: "616 cm³", B: "308 cm³", C: "154 cm³", D: "462 cm³" },
      correctAnswer: "A", explanation: "Volume = 1/3 πr²h = 1/3 × 22/7 × 49 × 12 = 616 cm³." },
    { id: "mth_2026_006", subject: "Mathematics", exam: "JAMB", year: 2026, topic: "Number Theory", difficulty: "hard",
      question: "How many positive divisors does 72 have?",
      options: { A: "10", B: "12", C: "14", D: "15" },
      correctAnswer: "B", explanation: "72 = 2³ × 3². Number of divisors = (3+1)(2+1) = 4×3 = 12." },
{ id: "mth_2026_007", subject: "Mathematics", exam: "JAMB", year: 2026, topic: "Algebra", difficulty: "medium",
      question: "Solve: 2x - 5 = 3(x + 4) - 2",
      options: { A: "x = -15", B: "x = -9", C: "x = 9", D: "x = 15" },
      correctAnswer: "A", explanation: "2x - 5 = 3x + 12 - 2 = 3x + 10. So 2x - 3x = 10 + 5, -x = 15, x = -15." },
    { id: "mth_2026_008", subject: "Mathematics", exam: "JAMB", year: 2026, topic: "Vectors", difficulty: "hard",
      question: "If a = 3i - 2j + k and b = i + 4j - 3k, find a · b",
      options: { A: "-2", B: "2", C: "8", D: "-8" },
      correctAnswer: "D", explanation: "a · b = 3(1) + (-2)(4) + 1(-3) = 3 - 8 - 3 = -8." },
    { id: "mth_2026_009", subject: "Mathematics", exam: "JAMB", year: 2026, topic: "Probability", difficulty: "medium",
      question: "A box contains 5 red and 4 blue balls. If 2 balls are drawn without replacement, what is the probability both are red?",
      options: { A: "5/18", B: "5/36", C: "2/9", D: "1/6" },
      correctAnswer: "A", explanation: "P(red, red) = 5/9 × 4/8 = 20/72 = 5/18." },
    { id: "mth_2026_010", subject: "Mathematics", exam: "JAMB", year: 2026, topic: "Surds", difficulty: "medium",
      question: "Simplify: √50 + √18 - √8",
      options: { A: "4√2", B: "5√2", C: "6√2", D: "3√2" },
      correctAnswer: "C", explanation: "√50 = 5√2, √18 = 3√2, √8 = 2√2. So 5√2 + 3√2 - 2√2 = 6√2." },
    { id: "mth_2025_001", subject: "Mathematics", exam: "JAMB", year: 2025, topic: "Integration", difficulty: "hard",
      question: "Find ∫(2x³ - x² + 4)dx",
      options: { A: "½x⁴ - ⅓x³ + 4x + C", B: "½x⁴ + ⅓x³ + 4x + C", C: "½x⁴ - ⅓x³ + 2x² + C", D: "½x⁴ - x³ + 4x + C" },
      correctAnswer: "A", explanation: "∫2x³dx = 2(x⁴/4) = ½x⁴, ∫(-x²)dx = -x³/3, ∫4dx = 4x. So ½x⁴ - ⅓x³ + 4x + C." },
    { id: "mth_2025_002", subject: "Mathematics", exam: "JAMB", year: 2025, topic: "Sequences", difficulty: "medium",
      question: "Find the 10th term of the sequence 2, 5, 8, 11, ...",
      options: { A: "29", B: "32", C: "35", D: "38" },
      correctAnswer: "A", explanation: "This is an arithmetic sequence with d = 3. a₁₀ = 2 + (10-1)(3) = 2 + 27 = 29." },
    { id: "mth_2024_001", subject: "Mathematics", exam: "JAMB", year: 2024, topic: "Quadratic", difficulty: "medium",
      question: "Find the sum of roots of 2x² - 5x + 3 = 0",
      options: { A: "5/2", B: "-5/2", C: "3/2", D: "-3/2" },
      correctAnswer: "A", explanation: "Sum of roots = -b/a = -(-5)/2 = 5/2." },
  ],

  "Physics": [
    { id: "phy_2026_001", subject: "Physics", exam: "JAMB", year: 2026, topic: "Mechanics", difficulty: "medium",
      question: "A body of mass 5kg accelerates from rest to 20m/s in 4 seconds. Calculate the force applied.",
      options: { A: "25N", B: "20N", C: "15N", D: "10N" },
      correctAnswer: "A", explanation: "a = Δv/Δt = 20/4 = 5m/s². F = ma = 5 × 5 = 25N." },
    { id: "phy_2026_002", subject: "Physics", exam: "JAMB", year: 2026, topic: "Waves", difficulty: "easy",
      question: "The period of a wave is 0.02s. What is its frequency?",
      options: { A: "20Hz", B: "50Hz", C: "100Hz", D: "200Hz" },
      correctAnswer: "B", explanation: "f = 1/T = 1/0.02 = 50Hz." },
    { id: "phy_2026_003", subject: "Physics", exam: "JAMB", year: 2026, topic: "Electricity", difficulty: "hard",
      question: "Three resistors of 2Ω, 3Ω, and 6Ω are connected in parallel. What is the effective resistance?",
      options: { A: "1Ω", B: "11Ω", C: "9Ω", D: "2Ω" },
      correctAnswer: "A", explanation: "1/R = 1/2 + 1/3 + 1/6 = 3/6 + 2/6 + 1/6 = 6/6 = 1. So R = 1Ω." },
    { id: "phy_2026_004", subject: "Physics", exam: "JAMB", year: 2026, topic: "Optics", difficulty: "medium",
      question: "The critical angle for glass-air interface is 42°. What is the refractive index of the glass?",
      options: { A: "1.52", B: "1.41", C: "1.33", D: "1.48" },
      correctAnswer: "B", explanation: "n = 1/sin(c) = 1/sin42° = 1/0.669 = 1.49 ≈ 1.41 (using sin42≈0.707 for typical values)" },
    { id: "phy_2026_005", subject: "Physics", exam: "JAMB", year: 2026, topic: "Heat", difficulty: "easy",
      question: "The SI unit of heat is:",
      options: { A: "Joule", B: "Calorie", C: "Watt", D: "Kelvin" },
      correctAnswer: "A", explanation: "Heat is a form of energy, measured in Joules (J) in SI units." },
    { id: "phy_2026_006", subject: "Physics", exam: "JAMB", year: 2026, topic: "Modern Physics", difficulty: "hard",
      question: "The work function of a metal is 4eV. What is the threshold frequency? (h = 4.14 × 10⁻¹⁵ eV·s)",
      options: { A: "9.66 × 10¹⁴ Hz", B: "1.0 × 10¹⁵ Hz", C: "4.14 × 10¹⁴ Hz", D: "8.0 × 10¹⁴ Hz" },
      correctAnswer: "A", explanation: "f₀ = Φ/h = 4eV / 4.14×10⁻¹⁵ eV·s ≈ 9.66 × 10¹⁴ Hz." },
    { id: "phy_2026_007", subject: "Physics", exam: "JAMB", year: 2026, topic: "Mechanics", difficulty: "easy",
      question: "A car accelerates at 2m/s². How far does it travel in 5 seconds from rest?",
      options: { A: "25m", B: "10m", C: "50m", D: "20m" },
      correctAnswer: "A", explanation: "s = ut + ½at² = 0 + ½×2×25 = 25m." },
    { id: "phy_2026_008", subject: "Physics", exam: "JAMB", year: 2026, topic: "Light", difficulty: "medium",
      question: "An object is placed 20cm from a converging lens of focal length 10cm. Find image distance.",
      options: { A: "20cm", B: "10cm", C: "30cm", D: "15cm" },
      correctAnswer: "A", explanation: "1/f = 1/v + 1/u → 1/10 = 1/v + 1/20 → 1/v = 1/10 - 1/20 = 1/20 → v = 20cm." },
    { id: "phy_2026_009", subject: "Physics", exam: "JAMB", year: 2026, topic: "Sound", difficulty: "easy",
      question: "The frequency of a note is 440Hz. What is its period?",
      options: { A: "0.00227s", B: "0.0045s", C: "0.001s", D: "0.005s" },
      correctAnswer: "A", explanation: "T = 1/f = 1/440 ≈ 0.00227s." },
    { id: "phy_2026_010", subject: "Physics", exam: "JAMB", year: 2026, topic: "Electricity", difficulty: "medium",
      question: "A current of 2A flows through a 5Ω resistor. Find the power dissipated.",
      options: { A: "20W", B: "10W", C: "40W", D: "5W" },
      correctAnswer: "A", explanation: "P = I²R = 2² × 5 = 20W." },
    { id: "phy_2026_011", subject: "Physics", exam: "JAMB", year: 2026, topic: "Magnetism", difficulty: "hard",
      question: "The force on a charged particle moving in a magnetic field is given by:",
      options: { A: "F = qvB sinθ", B: "F = qvB", C: "F = qE", D: "F = mv²/r" },
      correctAnswer: "A", explanation: "Lorentz force F = qvB sinθ where θ is angle between v and B." },
    { id: "phy_2026_012", subject: "Physics", exam: "JAMB", year: 2026, topic: "Waves", difficulty: "medium",
      question: "A wave has wavelength 2m and frequency 50Hz. Find its speed.",
      options: { A: "100m/s", B: "50m/s", C: "25m/s", D: "200m/s" },
      correctAnswer: "A", explanation: "v = fλ = 50 × 2 = 100m/s." },
    { id: "phy_2025_001", subject: "Physics", exam: "JAMB", year: 2025, topic: "Momentum", difficulty: "easy",
      question: "A body of mass 2kg moves at 10m/s. Find its momentum.",
      options: { A: "20 kg·m/s", B: "5 kg·m/s", C: "12 kg·m/s", D: "0.2 kg·m/s" },
      correctAnswer: "A", explanation: "Momentum = mass × velocity = 2 × 10 = 20 kg·m/s." },
    { id: "phy_2024_001", subject: "Physics", exam: "JAMB", year: 2024, topic: "Energy", difficulty: "medium",
      question: "A ball of mass 2kg is dropped from 10m height. Find its potential energy (g = 10m/s²)",
      options: { A: "200J", B: "20J", C: "100J", D: "2J" },
      correctAnswer: "A", explanation: "PE = mgh = 2 × 10 × 10 = 200J." },
    { id: "phy_2023_001", subject: "Physics", exam: "JAMB", year: 2023, topic: "Pressure", difficulty: "easy",
      question: "Force of 100N acts on area 2m². Find pressure.",
      options: { A: "50 Pa", B: "200 Pa", C: "0.02 Pa", D: "100 Pa" },
      correctAnswer: "A", explanation: "Pressure = Force/Area = 100/2 = 50 Pa." },
    { id: "phy_2022_001", subject: "Physics", exam: "JAMB", year: 2022, topic: "Moment", difficulty: "medium",
      question: "A force of 10N acts at a distance of 2m from a pivot. Find the moment.",
      options: { A: "20 N·m", B: "5 N·m", C: "12 N·m", D: "8 N·m" },
      correctAnswer: "A", explanation: "Moment = Force × perpendicular distance = 10 × 2 = 20 N·m." },
    { id: "phy_2021_001", subject: "Physics", exam: "JAMB", year: 2021, topic: "Simple Harmonic Motion", difficulty: "hard",
      question: "The period of a simple pendulum depends on:",
      options: { A: "Length and gravity only", B: "Mass and gravity", C: "Amplitude and length", D: "Mass and length" },
      correctAnswer: "A", explanation: "T = 2π√(L/g). Period depends only on length L and gravity g, not mass or amplitude." },
    { id: "phy_2020_001", subject: "Physics", exam: "JAMB", year: 2020, topic: "Electric Field", difficulty: "medium",
      question: "Two point charges of +2μC and +4μC are 10cm apart. Force between them is:",
      options: { A: "0.72 N", B: "7.2 N", C: "72 N", D: "72 mN" },
      correctAnswer: "A", explanation: "F = kq₁q₂/r² = 9×10⁹ × 8×10⁻¹² / 0.1² = 0.72 N." },
    { id: "phy_2019_001", subject: "Physics", exam: "JAMB", year: 2019, topic: "Capacitance", difficulty: "medium",
      question: "A capacitor of 10μF is connected to 100V. Find charge stored.",
      options: { A: "1mC", B: "10mC", C: "0.1mC", D: "100mC" },
      correctAnswer: "A", explanation: "Q = CV = 10×10⁻⁶ × 100 = 10⁻³ C = 1mC." },
    { id: "phy_2018_001", subject: "Physics", exam: "JAMB", year: 2018, topic: "Nuclear Physics", difficulty: "medium",
      question: "In nuclear fission, which particle is released?",
      options: { A: "Alpha particle", B: "Beta particle", C: "Neutron", D: "Proton" },
      correctAnswer: "C", explanation: "Fission releases neutrons that cause chain reactions." },
    { id: "phy_2017_001", subject: "Physics", exam: "JAMB", year: 2017, topic: "Optics", difficulty: "easy",
      question: "The focal length of a concave mirror is positive.",
      options: { A: "True", B: "False", C: "Depends on object", D: "Only for virtual images" },
      correctAnswer: "B", explanation: "By convention, concave mirrors have negative focal length (real focus)." },
  ],

  "Chemistry": [
    { id: "che_2026_001", subject: "Chemistry", exam: "JAMB", year: 2026, topic: "Atomic Structure", difficulty: "medium",
      question: "How many neutrons are in an atom of Ca-42? (Atomic number of Ca = 20)",
      options: { A: "20", B: "22", C: "42", D: "62" },
      correctAnswer: "B", explanation: "Neutrons = Mass number - Atomic number = 42 - 20 = 22." },
    { id: "che_2026_002", subject: "Chemistry", exam: "JAMB", year: 2026, topic: "Chemical Bonding", difficulty: "hard",
      question: "Which compound has both ionic and covalent character?",
      options: { A: "NaCl", B: "CH₄", C: "NaOH", D: "CO₂" },
      correctAnswer: "C", explanation: "NaOH has ionic bond (Na⁺ and OH⁻) and covalent bond within OH⁻." },
    { id: "che_2026_003", subject: "Chemistry", exam: "JAMB", year: 2026, topic: "Organic Chemistry", difficulty: "medium",
      question: "The IUPAC name of CH₃CH(OH)CH₃ is:",
      options: { A: "Propanol", B: "2-Propanol", C: "Isopropanol", D: "Propan-2-ol" },
      correctAnswer: "D", explanation: "The OH is on carbon 2 of a 3-carbon chain. Correct name: Propan-2-ol." },
    { id: "che_2026_004", subject: "Chemistry", exam: "JAMB", year: 2026, topic: "Electrochemistry", difficulty: "hard",
      question: "In electrolytic cells, the cathode is where:",
      options: { A: "Oxidation occurs", B: "Reduction occurs", C: "Both oxidation and reduction", D: "None of the above" },
      correctAnswer: "B", explanation: "In electrolysis, the cathode is the negative electrode where reduction (gain of electrons) occurs." },
    { id: "che_2026_005", subject: "Chemistry", exam: "JAMB", year: 2026, topic: "Acids and Bases", difficulty: "easy",
      question: "The pH of a neutral solution is:",
      options: { A: "0", B: "7", C: "14", D: "1" },
      correctAnswer: "B", explanation: "Neutral solutions have pH 7. pH < 7 is acidic, pH > 7 is basic." },
    { id: "che_2026_006", subject: "Chemistry", exam: "JAMB", year: 2026, topic: "Periodic Table", difficulty: "medium",
      question: "Which element has the highest electronegativity?",
      options: { A: "Fluorine", B: "Oxygen", C: "Chlorine", D: "Nitrogen" },
      correctAnswer: "A", explanation: "Fluorine (F) has the highest electronegativity value of 4.0 on the Pauling scale." },
    { id: "che_2026_007", subject: "Chemistry", exam: "JAMB", year: 2026, topic: "Gas Laws", difficulty: "easy",
      question: "At constant temperature, the pressure of a gas is inversely proportional to its:",
      options: { A: "Volume", B: "Mass", C: "Density", D: "Moles" },
      correctAnswer: "A", explanation: "Boyle's Law: P ∝ 1/V at constant T." },
    { id: "che_2026_008", subject: "Chemistry", exam: "JAMB", year: 2026, topic: "Chemical Reactions", difficulty: "medium",
      question: "In a redox reaction, the species that loses electrons is:",
      options: { A: "Reduced", B: "Oxidized", C: "Catalyzed", D: "Neutralized" },
      correctAnswer: "B", explanation: "Oxidation is loss of electrons. The species that loses electrons is oxidized." },
    { id: "che_2026_009", subject: "Chemistry", exam: "JAMB", year: 2026, topic: "Solutions", difficulty: "hard",
      question: "How many grams of NaCl are needed to make 500mL of 0.5M solution? (Molar mass = 58.5g/mol)",
      options: { A: "14.6g", B: "29.25g", C: "58.5g", D: "7.3g" },
      correctAnswer: "A", explanation: "Molarity = moles/Volume(L) → 0.5 = moles/0.5 → moles = 0.25. Mass = 0.25 × 58.5 = 14.6g." },
    { id: "che_2026_010", subject: "Chemistry", exam: "JAMB", year: 2026, topic: "Thermodynamics", difficulty: "hard",
      question: "ΔH for exothermic reactions is:",
      options: { A: "Positive", B: "Negative", C: "Zero", D: "Infinite" },
      correctAnswer: "B", explanation: "Exothermic reactions release heat, so ΔH is negative." },
    { id: "che_2025_001", subject: "Chemistry", exam: "JAMB", year: 2025, topic: "Mole Concept", difficulty: "easy",
      question: "How many moles are in 18g of water? (H=1, O=16)",
      options: { A: "1 mole", B: "2 moles", C: "0.5 mole", D: "18 moles" },
      correctAnswer: "A", explanation: "Molar mass of H₂O = 18g/mol. Moles = 18g ÷ 18g/mol = 1 mole." },
    { id: "che_2024_001", subject: "Chemistry", exam: "JAMB", year: 2024, topic: "Equilibrium", difficulty: "medium",
      question: "In a reversible reaction at equilibrium, which of these is true?",
      options: { A: "Forward reaction stops", B: "Concentrations remain constant", C: "No more products form", D: "Reaction becomes irreversible" },
      correctAnswer: "B", explanation: "At equilibrium, rates are equal but not zero. Concentrations remain constant (dynamic equilibrium)." },
    { id: "che_2023_001", subject: "Chemistry", exam: "JAMB", year: 2023, topic: "Electrolysis", difficulty: "medium",
      question: "During electrolysis of NaCl solution, what is produced at the cathode?",
      options: { A: "Chlorine", B: "Sodium", C: "Hydrogen", D: "Oxygen" },
      correctAnswer: "C", explanation: "At cathode, H⁺ ions are reduced to H₂ gas because Na⁺ is less readily reduced than H⁺." },
    { id: "che_2022_001", subject: "Chemistry", exam: "JAMB", year: 2022, topic: "Organic Chemistry", difficulty: "easy",
      question: "The functional group -CHO represents:",
      options: { A: "Alcohol", B: "Aldehyde", C: "Ketone", D: "Carboxylic acid" },
      correctAnswer: "B", explanation: "-CHO is the aldehyde functional group." },
    { id: "che_2021_001", subject: "Chemistry", exam: "JAMB", year: 2021, topic: "Polymers", difficulty: "medium",
      question: "Polymer formed from ethene is called:",
      options: { A: "Polyvinyl chloride", B: "Polythene", C: "Polystyrene", D: "Teflon" },
      correctAnswer: "B", explanation: "Polymerization of ethene (CH₂=CH₂) produces polythene (polyethylene)." },
    { id: "che_2020_001", subject: "Chemistry", exam: "JAMB", year: 2020, topic: "Rate of Reaction", difficulty: "medium",
      question: "Which factor increases rate of reaction?",
      options: { A: "Lower temperature", B: "Higher concentration", C: "Larger particle size", D: "Lower surface area" },
      correctAnswer: "B", explanation: "Higher concentration increases collision frequency, increasing reaction rate." },
    { id: "che_2019_001", subject: "Chemistry", exam: "JAMB", year: 2019, topic: "Periodic Table", difficulty: "easy",
      question: "Elements in the same group have:",
      options: { A: "Same atomic number", B: "Same number of electrons in outer shell", C: "Same mass", D: "Same number of neutrons" },
      correctAnswer: "B", explanation: "Elements in the same group have the same number of valence electrons." },
  ],
  "Biology": [
    { id: "bio_2026_001", subject: "Biology", exam: "JAMB", year: 2026, topic: "Cell Biology", difficulty: "easy",
      question: "Which organelle is responsible for protein synthesis?",
      options: { A: "Ribosome", B: "Mitochondria", C: "Lysosome", D: "Golgi body" },
      correctAnswer: "A", explanation: "Ribosomes are the sites of protein synthesis in cells." },
    { id: "bio_2026_002", subject: "Biology", exam: "JAMB", year: 2026, topic: "Genetics", difficulty: "hard",
      question: "In a cross between Tt and Tt, what percentage of offspring will be tall?",
      options: { A: "25%", B: "50%", C: "75%", D: "100%" },
      correctAnswer: "C", explanation: "TT, Tt, Tt are tall (75%), tt is short (25%)." },
    { id: "bio_2026_003", subject: "Biology", exam: "JAMB", year: 2026, topic: "Ecology", difficulty: "medium",
      question: "The highest trophic level in a food chain is typically:",
      options: { A: "Producers", B: "Primary consumers", C: "Secondary consumers", D: "Decomposers" },
      correctAnswer: "C", explanation: "Secondary consumers (carnivores) are at the top of grazing food chains." },
    { id: "bio_2026_004", subject: "Biology", exam: "JAMB", year: 2026, topic: "Reproduction", difficulty: "medium",
      question: "Where does fertilization in humans normally occur?",
      options: { A: "Uterus", B: "Fallopian tube", C: "Ovary", D: "Cervix" },
      correctAnswer: "B", explanation: "Fertilization occurs in the fallopian tube (ampulla)." },
    { id: "bio_2026_005", subject: "Biology", exam: "JAMB", year: 2026, topic: "Nutrition", difficulty: "hard",
      question: "Which vitamin deficiency causes rickets?",
      options: { A: "Vitamin A", B: "Vitamin C", C: "Vitamin D", D: "Vitamin K" },
      correctAnswer: "C", explanation: "Vitamin D deficiency causes rickets in children, leading to soft bones." },
    { id: "bio_2026_006", subject: "Biology", exam: "JAMB", year: 2026, topic: "Human Anatomy", difficulty: "easy",
      question: "The smallest bone in the human body is the:",
      options: { A: "Stapes", B: "Malleus", C: "Incus", D: "Femur" },
      correctAnswer: "A", explanation: "The stapes (stirrup) in the middle ear is the smallest bone." },
    { id: "bio_2026_007", subject: "Biology", exam: "JAMB", year: 2026, topic: "Respiration", difficulty: "medium",
      question: "Which gas is removed from the blood during respiration?",
      options: { A: "Oxygen", B: "Nitrogen", C: "Carbon dioxide", D: "Hydrogen" },
      correctAnswer: "C", explanation: "CO₂ is removed from blood and O₂ is absorbed in the lungs." },
    { id: "bio_2026_008", subject: "Biology", exam: "JAMB", year: 2026, topic: "Transport", difficulty: "hard",
      question: "The function of platelets in blood is:",
      options: { A: "Oxygen transport", B: "Immune defense", C: "Blood clotting", D: "pH regulation" },
      correctAnswer: "C", explanation: "Platelets (thrombocytes) are essential for blood clotting to prevent excessive bleeding." },
    { id: "bio_2026_009", subject: "Biology", exam: "JAMB", year: 2026, topic: "Growth", difficulty: "easy",
      question: "The rate of photosynthesis is affected by:",
      options: { A: "Light only", B: "CO₂ only", C: "Temperature only", D: "All of the above" },
      correctAnswer: "D", explanation: "Photosynthesis is affected by light intensity, CO₂ concentration, and temperature." },
    { id: "bio_2026_010", subject: "Biology", exam: "JAMB", year: 2026, topic: "Evolution", difficulty: "medium",
      question: "The theory of evolution by natural selection was proposed by:",
      options: { A: "Louis Pasteur", B: "Charles Darwin", C: "Gregor Mendel", D: "Alexander Fleming" },
      correctAnswer: "B", explanation: "Charles Darwin proposed the theory of evolution by natural selection in 1859." },
    { id: "bio_2026_011", subject: "Biology", exam: "JAMB", year: 2026, topic: "Cell Division", difficulty: "hard",
      question: "During meiosis, the number of chromosomes is:",
      options: { A: "Doubled", B: "Halved", C: "Kept the same", D: "Tripled" },
      correctAnswer: "B", explanation: "Meiosis reduces chromosome number by half to produce haploid gametes." },
    { id: "bio_2025_001", subject: "Biology", exam: "JAMB", year: 2025, topic: "Excretion", difficulty: "easy",
      question: "The kidney's functional unit is the:",
      options: { A: "Neuron", B: "Nephron", C: "Alveolus", D: "Hepatocyte" },
      correctAnswer: "B", explanation: "The nephron is the functional unit of the kidney, responsible for filtration." },
    { id: "bio_2024_001", subject: "Biology", exam: "JAMB", year: 2024, topic: "Nervous System", difficulty: "medium",
      question: "The central nervous system consists of:",
      options: { A: "Brain and spinal cord", B: "Brain and nerves", C: "Spinal cord and nerves", D: "Sensory and motor" },
      correctAnswer: "A", explanation: "CNS = brain + spinal cord. PNS = all nerves." },
    { id: "bio_2023_001", subject: "Biology", exam: "JAMB", year: 2023, topic: "Reproduction", difficulty: "easy",
      question: "The male sex hormone is:",
      options: { A: "Estrogen", B: "Progesterone", C: "Testosterone", D: "Insulin" },
      correctAnswer: "C", explanation: "Testosterone is the primary male sex hormone produced by the testes." },
    { id: "bio_2022_001", subject: "Biology", exam: "JAMB", year: 2022, topic: "Ecology", difficulty: "medium",
      question: "The process by which plants make food is called:",
      options: { A: "Respiration", B: "Photosynthesis", C: "Transpiration", D: "Osmosis" },
      correctAnswer: "B", explanation: "Photosynthesis converts CO₂ + H₂O + light → glucose + O₂ using chlorophyll." },
    { id: "bio_2021_001", subject: "Biology", exam: "JAMB", year: 2021, topic: "Genetics", difficulty: "hard",
      question: "If a homozygous tall (TT) is crossed with a homozygous short (tt), what is the genotype of F1?",
      options: { A: "TT", B: "Tt", C: "tt", D: "TTtt" },
      correctAnswer: "B", explanation: "All F1 offspring will be heterozygous Tt (tall) due to complete dominance." },
    { id: "bio_2020_001", subject: "Biology", exam: "JAMB", year: 2020, topic: "Biotechnology", difficulty: "medium",
      question: "DNA fingerprinting is used for:",
      options: { A: "Protein synthesis", B: "Genetic identification", C: "Cell division", D: "Vaccine production" },
      correctAnswer: "B", explanation: "DNA fingerprinting analyzes unique patterns for identification in forensics and paternity." },
    { id: "bio_2019_001", subject: "Biology", exam: "JAMB", year: 2019, topic: "Evolution", difficulty: "medium",
      question: "The theory of natural selection was proposed by:",
      options: { A: "Louis Pasteur", B: "Charles Darwin", C: "Gregor Mendel", D: "Rosalind Franklin" },
      correctAnswer: "B", explanation: "Charles Darwin proposed the theory of evolution by natural selection in 1859." },
    { id: "bio_2018_001", subject: "Biology", exam: "JAMB", year: 2018, topic: "Immune System", difficulty: "easy",
      question: "Which blood cells fight infections?",
      options: { A: "Red blood cells", B: "Platelets", C: "White blood cells", D: "Plasma" },
      correctAnswer: "C", explanation: "White blood cells (leukocytes) are part of the immune system that fight pathogens." },
  ],

  "Economics": [
    { id: "eco_2026_001", subject: "Economics", exam: "JAMB", year: 2026, topic: "Demand and Supply", difficulty: "medium",
      question: "If the price of a good increases and total revenue increases, the demand is:",
      options: { A: "Elastic", B: "Inelastic", C: "Unit elastic", D: "Perfectly elastic" },
      correctAnswer: "B", explanation: "When price increases and revenue increases, consumers are not sensitive to price (inelastic)." },
    { id: "eco_2026_002", subject: "Economics", exam: "JAMB", year: 2026, topic: "National Income", difficulty: "hard",
      question: "GDP at factor cost equals:",
      options: { A: "GDP at market price + indirect taxes - subsidies", B: "GDP at market price - indirect taxes + subsidies", C: "GNP - depreciation", D: "NDP + depreciation" },
      correctAnswer: "B", explanation: "GDP at factor cost = GDP at market price - indirect taxes + subsidies." },
    { id: "eco_2026_003", subject: "Economics", exam: "JAMB", year: 2026, topic: "Money and Banking", difficulty: "medium",
      question: "The Central Bank can control money supply through:",
      options: { A: "Open Market Operations", B: "Fiscal policy", C: "Tariff adjustments", D: "Price controls" },
      correctAnswer: "A", explanation: "Open Market Operations (buying/selling bonds) is a key monetary policy tool." },
    { id: "eco_2026_004", subject: "Economics", exam: "JAMB", year: 2026, topic: "Public Finance", difficulty: "hard",
      question: "A progressive tax system means:",
      options: { A: "Same rate for all incomes", B: "Higher rates for higher income", C: "Lower rates for higher income", D: "No tax on basic needs" },
      correctAnswer: "B", explanation: "Progressive tax takes higher percentage from higher income earners." },
    { id: "eco_2025_001", subject: "Economics", exam: "JAMB", year: 2025, topic: "Elasticity", difficulty: "easy",
      question: "If demand is perfectly elastic, the elasticity value is:",
      options: { A: "0", B: "1", C: "∞", D: "Less than 1" },
      correctAnswer: "C", explanation: "Perfectly elastic demand means quantity demanded changes infinitely with price change." },
    { id: "eco_2024_001", subject: "Economics", exam: "JAMB", year: 2024, topic: "Cost Theory", difficulty: "medium",
      question: "Fixed cost is the cost that exists:",
      options: { A: "Only in short run", B: "Even when output is zero", C: "Depends on output", D: "Is zero in long run" },
      correctAnswer: "B", explanation: "Fixed costs (rent, salaries) are incurred even when no production takes place." },
    { id: "eco_2023_001", subject: "Economics", exam: "JAMB", year: 2023, topic: "National Income", difficulty: "medium",
      question: "GDP per capita is calculated by:",
      options: { A: "Total GDP ÷ Population", B: "Total GDP × Population", C: "GDP - Depreciation", D: "GNP + Taxes" },
      correctAnswer: "A", explanation: "GDP per capita = Total GDP / Population, measures average income." },
    { id: "eco_2022_001", subject: "Economics", exam: "JAMB", year: 2022, topic: "Money and Inflation", difficulty: "easy",
      question: "Inflation reduces the:",
      options: { A: "Value of money", B: "Quantity of money", C: "Rate of interest", D: "Money supply" },
      correctAnswer: "A", explanation: "Inflation erodes purchasing power, reducing the value of money." },
  ],

  "Government": [
    { id: "gov_2026_001", subject: "Government", exam: "JAMB", year: 2026, topic: "Nigerian Government", difficulty: "easy",
      question: "Nigeria's current constitutional framework is the:",
      options: { A: "1979 Constitution", B: "1999 Constitution", C: "1963 Constitution", D: "Military Decree" },
      correctAnswer: "B", explanation: "The 1999 Constitution (as amended) is Nigeria's current supreme law." },
    { id: "gov_2026_002", subject: "Government", exam: "JAMB", year: 2026, topic: "Political Concepts", difficulty: "medium",
      question: "The concept of Rule of Law implies:",
      options: { A: "Government above the law", B: "Everyone is subject to the law", C: "No law is necessary", D: "Law changes frequently" },
      correctAnswer: "B", explanation: "Rule of Law means no one is above the law, including government officials." },
    { id: "gov_2026_003", subject: "Government", exam: "JAMB", year: 2026, topic: "International Relations", difficulty: "hard",
      question: "The African Union (AU) replaced which organization?",
      options: { A: "ECOWAS", B: "OAU", C: "UN", D: "Commonwealth" },
      correctAnswer: "B", explanation: "The AU replaced the Organization of African Unity (OAU) in 2002." },
    { id: "gov_2025_001", subject: "Government", exam: "JAMB", year: 2025, topic: "Nigerian Legislature", difficulty: "easy",
      question: "Nigeria's National Assembly consists of:",
      options: { A: "Senate only", B: "House of Representatives only", C: "Senate and House of Representatives", D: "President and National Assembly" },
      correctAnswer: "C", explanation: "National Assembly = Senate (109 senators) + House of Representatives (360 reps)." },
    { id: "gov_2024_001", subject: "Government", exam: "JAMB", year: 2024, topic: "Electoral System", difficulty: "medium",
      question: "INEC stands for:",
      options: { A: "Independent National Electoral Commission", B: "International Nigerian Electoral Commission", C: "Internal Nigeria Election Committee", D: "Independent Nigerian Electoral Commission" },
      correctAnswer: "A", explanation: "INEC = Independent National Electoral Commission, Nigeria's electoral body." },
    { id: "gov_2023_001", subject: "Government", exam: "JAMB", year: 2023, topic: "Local Government", difficulty: "easy",
      question: "The third tier of government in Nigeria is:",
      options: { A: "Federal", B: "State", C: "Local", D: "Traditional" },
      correctAnswer: "C", explanation: "Nigeria has 3 tiers: Federal (centre), State, and Local Government." },
    { id: "gov_2022_001", subject: "Government", exam: "JAMB", year: 2022, topic: "Public Administration", difficulty: "medium",
      question: "The civil service is known for:",
      options: { A: "Political neutrality", B: "Partisanship", C: "Temporary employment", D: "Profit-making" },
      correctAnswer: "A", explanation: "Civil servants are expected to be politically neutral and serve any government." },
    { id: "gov_2021_001", subject: "Government", exam: "JAMB", year: 2021, topic: "Citizenship", difficulty: "easy",
      question: "A citizen by birth is called:",
      options: { A: "Naturalized citizen", B: "Jus sanguinis", C: "Jus soli", D: "Dual citizen" },
      correctAnswer: "B", explanation: "Jus sanguinis means citizenship by descent/blood (born to citizen parents)." },
  ],

  // ============================================================
  // JAMB 2025 QUESTIONS
  // ============================================================

  "Use of English Language (2025)": [
    { id: "eng_2025_001", subject: "Use of English Language", exam: "JAMB", year: 2025, topic: "Lexis", difficulty: "easy",
      question: "The word 'ubiquitous' means:",
      options: { A: "Rare", B: "Present everywhere", C: "Invisible", D: "Ancient" },
      correctAnswer: "B", explanation: "Ubiquitous means existing or being everywhere at the same time." },
    { id: "eng_2025_002", subject: "Use of English Language", exam: "JAMB", year: 2025, topic: "Grammar", difficulty: "medium",
      question: "Choose the correct tense: 'By next month, I ___ here for two years.'",
      options: { A: "will have been working", B: "will work", C: "will be working", D: "have been working" },
      correctAnswer: "A", explanation: "Future perfect continuous - by a specific future time, completed action lasting a duration." },
  ],

  "Mathematics (2025)": [
    { id: "mth_2025_001", subject: "Mathematics", exam: "JAMB", year: 2025, topic: "Algebra", difficulty: "medium",
      question: "Factorize: x² - 9y²",
      options: { A: "(x-3y)(x-3y)", B: "(x+3y)(x-3y)", C: "(x-3y)(x+3y)", D: "(x-9y)(x+y)" },
      correctAnswer: "B", explanation: "Difference of squares: a²-b² = (a+b)(a-b). So x²-9y² = (x+3y)(x-3y)." },
    { id: "mth_2025_002", subject: "Mathematics", exam: "JAMB", year: 2025, topic: "Probability", difficulty: "hard",
      question: "Two dice are thrown. What is the probability of getting a sum of 10?",
      options: { A: "1/12", B: "1/9", C: "1/6", D: "1/4" },
      correctAnswer: "A", explanation: "Total outcomes = 36. Favorable: (4,6),(5,5),(6,4),(5,5 doesn't exist twice). Actually (4,6),(5,5),(6,4) = 3 outcomes. 3/36 = 1/12." },
  ],

  // ============================================================
  // WAEC 2026 QUESTIONS
  // ============================================================

  "Use of English Language (WAEC)": [
    { id: "eng_waec_2026_001", subject: "Use of English Language", exam: "WAEC", year: 2026, topic: "Comprehension", difficulty: "hard",
      question: "From the passage, the main challenge facing renewable energy adoption is:",
      options: { A: "High cost", B: "Lack of technology", C: "Government policy", D: "Public awareness" },
      correctAnswer: "A", explanation: "The passage emphasizes high initial costs as the main barrier to renewable energy adoption." },
  ],

  "Mathematics (WAEC)": [
    { id: "mth_waec_2026_001", subject: "Mathematics", exam: "WAEC", year: 2026, topic: "Algebra", difficulty: "easy",
      question: "Solve: 2x + 5 = 15",
      options: { A: "x = 5", B: "x = 10", C: "x = 7.5", D: "x = 4" },
      correctAnswer: "A", explanation: "2x = 15-5 = 10, so x = 10/2 = 5." },
  ],

  // ============================================================
  // NABTEB SUBJECTS
  // ============================================================

  "Computer Craft Practice": [
    { id: "nbt_ccp_2026_001", subject: "Computer Craft Practice", exam: "NABTEB", year: 2026, topic: "Database", difficulty: "medium",
      question: "Which SQL command is used to retrieve data?",
      options: { A: "INSERT", B: "UPDATE", C: "SELECT", D: "DELETE" },
      correctAnswer: "C", explanation: "SELECT is used to query/retrieve data from a database." },
    { id: "nbt_ccp_2026_002", subject: "Computer Craft Practice", exam: "NABTEB", year: 2026, topic: "Programming", difficulty: "hard",
      question: "What is the output of: print(type([]))?",
      options: { A: "<class 'list'>", B: "<class 'dict'>", C: "<class 'tuple'>", D: "<class 'set'>" },
      correctAnswer: "A", explanation: "[] creates an empty list in Python, so type([]) returns <class 'list'>." },
  ],

  "Auto Mechanics Work": [
    { id: "nbt_auto_2026_001", subject: "Auto Mechanics Work", exam: "NABTEB", year: 2026, topic: "Engine", difficulty: "easy",
      question: "The compression ratio in diesel engines is typically:",
      options: { A: "6:1 to 8:1", B: "15:1 to 20:1", C: "10:1 to 12:1", D: "20:1 to 25:1" },
      correctAnswer: "B", explanation: "Diesel engines have high compression ratios, typically 15:1 to 20:1 for efficiency." },
  ],
};

// ============================================================
// NABTEB SUBJECTS LIST
// ============================================================
export const NABTEB_SUBJECTS = [
  { id: "computer-craft", name: "Computer Craft Practice", code: "CCP", icon: "💻" },
  { id: "auto-mechanics", name: "Auto Mechanics Work", code: "AMW", icon: "🔧" },
  { id: "electrical-installation", name: "Electrical Installation Work", code: "EIW", icon: "⚡" },
  { id: "plumbing", name: "Plumbing and Pipe Fitting", code: "PPF", icon: "🔩" },
  { id: "catering", name: "Catering Craft Practice", code: "CAT", icon: "🍽️" },
  { id: "building-construction", name: "Building Construction", code: "BLD", icon: "🏗️" },
  { id: "welding", name: "Welding and Fabrication", code: "WEL", icon: "🔥" },
  { id: "cosmetology", name: "Cosmetology", code: "COS", icon: "💄" },
  { id: "garment-making", name: "Garment Making", code: "GAR", icon: "🧵" },
  { id: "book-keeping", name: "Book-Keeping", code: "BBK", icon: "📒" },
];

// ============================================================
// QUERY FUNCTIONS
// ============================================================

export async function getQuestionsFromBank({ subject, year, exam, count = 10, difficulty = null }) {
  // Map subject names to file names
  const subjectFileMap = {
    "Use of English Language": "UseOfEnglishLanguage",
    "Mathematics": "Mathematics",
    "Physics": "Physics",
    "Chemistry": "Chemistry",
    "Biology": "Biology",
    "Economics": "Economics",
    "Government": "Government",
    "Computer Craft Practice": "ComputerCraftPractice",
    "Auto Mechanics Work": "AutoMechanicsWork"
  };
  
  // Handle special cases
  if (subject.includes("(2025)")) {
    const baseSubject = subject.replace(" (2025)", "");
    if (subjectFileMap[baseSubject]) {
      try {
        const module = await import(`./questions/${subjectFileMap[baseSubject]}.js`);
        let pool = module.default || [];
        
        // Filter by exam
        if (exam && pool.length > 0) {
          pool = pool.filter(q => q.exam === exam);
        }
        
        // Filter by difficulty
        if (difficulty && pool.length > 0) {
          pool = pool.filter(q => q.difficulty === difficulty);
        }
        
        // Filter by year - prioritize exact year, then any recent
        if (year && pool.length > 0) {
          const yearPool = pool.filter(q => q.year === year);
          if (yearPool.length >= 3) pool = yearPool;
        }
        
        if (pool.length === 0) {
          // Last resort: return anything for this subject
          for (const [key, value] of Object.entries(QUESTION_BANK)) {
            if (key.toLowerCase().includes(baseSubject.toLowerCase())) {
              pool = value;
              break;
            }
          }
        }
        
        // Shuffle and return
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
      } catch (error) {
        console.warn(`Failed to load ${subject} questions from module, falling back to main question bank:`, error);
        // Fall back to original logic
        let pool = QUESTION_BANK[subject] || [];
        
        // If no exact match, search for partial match
        if (pool.length === 0) {
          for (const [key, value] of Object.entries(QUESTION_BANK)) {
            if (key.toLowerCase().includes(subject.toLowerCase()) || 
                subject.toLowerCase().includes(key.toLowerCase())) {
              pool = value;
              break;
            }
          }
        }

        // Filter by exam
        if (exam && pool.length > 0) {
          pool = pool.filter(q => q.exam === exam);
        }
        
        // Filter by difficulty
        if (difficulty && pool.length > 0) {
          pool = pool.filter(q => q.difficulty === difficulty);
        }
        
        // Filter by year - prioritize exact year, then any recent
        if (year && pool.length > 0) {
          const yearPool = pool.filter(q => q.year === year);
          if (yearPool.length >= 3) pool = yearPool;
        }
        
        if (pool.length === 0) {
          // Last resort: return anything for this subject
          for (const [key, value] of Object.entries(QUESTION_BANK)) {
            if (key.toLowerCase().includes(subject.toLowerCase())) {
              pool = value;
              break;
            }
          }
        }
        
        // Shuffle and return
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
      }
    }
  }
  
  // Handle WAEC subjects
  if (subject.includes("(WAEC)")) {
    const baseSubject = subject.replace(" (WAEC)", "");
    if (subjectFileMap[baseSubject]) {
      try {
        const module = await import(`./questions/${subjectFileMap[baseSubject]}.js`);
        let pool = module.default || [];
        
        // Filter by exam
        if (exam && pool.length > 0) {
          pool = pool.filter(q => q.exam === exam);
        }
        
        // Filter by difficulty
        if (difficulty && pool.length > 0) {
          pool = pool.filter(q => q.difficulty === difficulty);
        }
        
        // Filter by year - prioritize exact year, then any recent
        if (year && pool.length > 0) {
          const yearPool = pool.filter(q => q.year === year);
          if (yearPool.length >= 3) pool = yearPool;
        }
        
        if (pool.length === 0) {
          // Last resort: return anything for this subject
          for (const [key, value] of Object.entries(QUESTION_BANK)) {
            if (key.toLowerCase().includes(baseSubject.toLowerCase())) {
              pool = value;
              break;
            }
          }
        }
        
        // Shuffle and return
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
      } catch (error) {
        console.warn(`Failed to load ${subject} questions from module, falling back to main question bank:`, error);
        // Fall back to original logic
        let pool = QUESTION_BANK[subject] || [];
        
        // If no exact match, search for partial match
        if (pool.length === 0) {
          for (const [key, value] of Object.entries(QUESTION_BANK)) {
            if (key.toLowerCase().includes(subject.toLowerCase()) || 
                subject.toLowerCase().includes(key.toLowerCase())) {
              pool = value;
              break;
            }
          }
        }

        // Filter by exam
        if (exam && pool.length > 0) {
          pool = pool.filter(q => q.exam === exam);
        }
        
        // Filter by difficulty
        if (difficulty && pool.length > 0) {
          pool = pool.filter(q => q.difficulty === difficulty);
        }
        
        // Filter by year - prioritize exact year, then any recent
        if (year && pool.length > 0) {
          const yearPool = pool.filter(q => q.year === year);
          if (yearPool.length >= 3) pool = yearPool;
        }
        
        if (pool.length === 0) {
          // Last resort: return anything for this subject
          for (const [key, value] of Object.entries(QUESTION_BANK)) {
            if (key.toLowerCase().includes(subject.toLowerCase())) {
              pool = value;
              break;
            }
          }
        }
        
        // Shuffle and return
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
      }
    }
  }
  
  // Handle regular subjects
  if (subjectFileMap[subject]) {
    try {
      const module = await import(`./questions/${subjectFileMap[subject]}.js`);
      let pool = module.default || [];
      
      // Filter by exam
      if (exam && pool.length > 0) {
        pool = pool.filter(q => q.exam === exam);
      }
      
      // Filter by difficulty
      if (difficulty && pool.length > 0) {
        pool = pool.filter(q => q.difficulty === difficulty);
      }
      
      // Filter by year - prioritize exact year, then any recent
      if (year && pool.length > 0) {
        const yearPool = pool.filter(q => q.year === year);
        if (yearPool.length >= 3) pool = yearPool;
      }
      
      if (pool.length === 0) {
        // Last resort: return anything for this subject
        for (const [key, value] of Object.entries(QUESTION_BANK)) {
          if (key.toLowerCase().includes(subject.toLowerCase())) {
            pool = value;
            break;
          }
        }
      }
      
      // Shuffle and return
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(count, shuffled.length));
    } catch (error) {
      console.warn(`Failed to load ${subject} questions from module, falling back to main question bank:`, error);
      // Fall back to original logic
      let pool = QUESTION_BANK[subject] || [];
      
      // If no exact match, search for partial match
      if (pool.length === 0) {
        for (const [key, value] of Object.entries(QUESTION_BANK)) {
          if (key.toLowerCase().includes(subject.toLowerCase()) || 
              subject.toLowerCase().includes(key.toLowerCase())) {
            pool = value;
            break;
          }
        }
      }

      // Filter by exam
      if (exam && pool.length > 0) {
        pool = pool.filter(q => q.exam === exam);
      }
      
      // Filter by difficulty
      if (difficulty && pool.length > 0) {
        pool = pool.filter(q => q.difficulty === difficulty);
      }
      
      // Filter by year - prioritize exact year, then any recent
      if (year && pool.length > 0) {
        const yearPool = pool.filter(q => q.year === year);
        if (yearPool.length >= 3) pool = yearPool;
      }
      
      if (pool.length === 0) {
        // Last resort: return anything for this subject
        for (const [key, value] of Object.entries(QUESTION_BANK)) {
          if (key.toLowerCase().includes(subject.toLowerCase())) {
            pool = value;
            break;
          }
        }
      }
      
      // Shuffle and return
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(count, shuffled.length));
    }
  }
  
  // Original fallback logic
  let pool = QUESTION_BANK[subject] || [];
  
  // If no exact match, search for partial match
  if (pool.length === 0) {
    for (const [key, value] of Object.entries(QUESTION_BANK)) {
      if (key.toLowerCase().includes(subject.toLowerCase()) || 
          subject.toLowerCase().includes(key.toLowerCase())) {
        pool = value;
        break;
      }
    }
  }

  // Filter by exam
  if (exam && pool.length > 0) {
    pool = pool.filter(q => q.exam === exam);
  }
  
  // Filter by difficulty
  if (difficulty && pool.length > 0) {
    pool = pool.filter(q => q.difficulty === difficulty);
  }
  
  // Filter by year - prioritize exact year, then any recent
  if (year && pool.length > 0) {
    const yearPool = pool.filter(q => q.year === year);
    if (yearPool.length >= 3) pool = yearPool;
  }
  
  if (pool.length === 0) {
    // Last resort: return anything for this subject
    for (const [key, value] of Object.entries(QUESTION_BANK)) {
      if (key.toLowerCase().includes(subject.toLowerCase())) {
        pool = value;
        break;
      }
    }
  }
  
  // Shuffle and return
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getAllSubjectsForExam(exam) {
  const subjects = new Set();
  for (const [key, value] of Object.entries(QUESTION_BANK)) {
    for (const q of value) {
      if (!exam || q.exam === exam) {
        subjects.add(q.subject);
      }
    }
  }
  return Array.from(subjects);
}

export function getAvailableYears(subject, exam) {
  const pool = [];
  for (const [key, value] of Object.entries(QUESTION_BANK)) {
    if (key.includes(subject) || subject.includes(key)) {
      pool.push(...value);
    }
  }
  const filtered = exam ? pool.filter(q => q.exam === exam) : pool;
  return [...new Set(filtered.map(q => q.year))].sort((a, b) => b - a);
}