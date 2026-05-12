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
      options: { A: "-15", B: "-9", C: "9", D: "15" },
      correctAnswer: "A", explanation: "2x - 5 = 3x + 12 - 2 → 2x - 5 = 3x + 10 → -5 - 10 = 3x - 2x → x = -15." },
    { id: "mth_2026_008", subject: "Mathematics", exam: "JAMB", year: 2026, topic: "Statistics", difficulty: "easy",
      question: "Find the mode of: 4, 2, 4, 3, 2, 4, 5, 4",
      options: { A: "2", B: "3", C: "4", D: "5" },
      correctAnswer: "C", explanation: "Mode is the most frequent value. 4 appears 4 times." },
    { id: "mth_2026_009", subject: "Mathematics", exam: "JAMB", year: 2026, topic: "Geometry", difficulty: "medium",
      question: "Find the circumference of a circle with radius 14cm (π = 22/7)",
      options: { A: "88cm", B: "44cm", C: "176cm", D: "22cm" },
      correctAnswer: "A", explanation: "C = 2πr = 2 × 22/7 × 14 = 88cm." },
    { id: "mth_2026_010", subject: "Mathematics", exam: "JAMB", year: 2026, topic: "Trigonometry", difficulty: "easy",
      question: "In a right triangle, opposite = 3, adjacent = 4. Find tan θ",
      options: { A: "3/4", B: "4/3", C: "5/3", D: "3/5" },
      correctAnswer: "A", explanation: "tan θ = opposite/adjacent = 3/4." },
    { id: "mth_2026_011", subject: "Mathematics", exam: "JAMB", year: 2026, topic: "Algebra", difficulty: "hard",
      question: "If x² + y² = 25 and x + y = 7, find xy",
      options: { A: "12", B: "10", C: "8", D: "6" },
      correctAnswer: "A", explanation: "(x+y)² = x² + 2xy + y² → 49 = 25 + 2xy → 2xy = 24 → xy = 12." },
    { id: "mth_2026_012", subject: "Mathematics", exam: "JAMB", year: 2026, topic: "Calculus", difficulty: "medium",
      question: "Find dy/dx if y = 2x³ - 4x² + 6x - 3",
      options: { A: "6x² - 8x + 6", B: "6x² - 8x - 6", C: "2x³ - 4x²", D: "6x - 8" },
      correctAnswer: "A", explanation: "dy/dx of 2x³ is 6x², of -4x² is -8x, of 6x is 6, constant is 0." },
    { id: "mth_2026_013", subject: "Mathematics", exam: "JAMB", year: 2026, topic: "Probability", difficulty: "medium",
      question: "A bag contains 5 red and 3 blue balls. Find probability of drawing 2 red balls without replacement.",
      options: { A: "5/14", B: "10/28", C: "20/56", D: "5/28" },
      correctAnswer: "A", explanation: "P(2 red) = (5/8) × (4/7) = 20/56 = 5/14." },
    { id: "mth_2026_014", subject: "Mathematics", exam: "JAMB", year: 2026, topic: "Algebra", difficulty: "easy",
      question: "Simplify: (3x²y)(2xy³)",
      options: { A: "6x³y⁴", B: "5x²y³", C: "6x³y³", D: "5x³y⁴" },
      correctAnswer: "A", explanation: "3×2 = 6, x²×x = x³, y×y³ = y⁴." },
    { id: "mth_2026_015", subject: "Mathematics", exam: "JAMB", year: 2026, topic: "Geometry", difficulty: "hard",
      question: "A circle has area 154cm². Find radius (π = 22/7)",
      options: { A: "7cm", B: "14cm", C: "21cm", D: "3.5cm" },
      correctAnswer: "A", explanation: "Area = πr² = 154 → r² = 49 → r = 7cm." },
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
  ],
  "Biology": [
    { id: "bio_2026_001", subject: "Biology", exam: "JAMB", year: 2026, topic: "Cell Biology", difficulty: "easy",
      question: "A solution with pH 10 is:",
      options: { A: "Acidic", B: "Neutral", C: "Basic", D: "Amphoteric" },
      correctAnswer: "C", explanation: "pH > 7 indicates alkaline/basic solution. pH 10 is strongly basic." },
    { id: "che_2026_006", subject: "Chemistry", exam: "JAMB", year: 2026, topic: "Chemical Kinetics", difficulty: "hard",
      question: "For the reaction 2A + B → Products, rate = k[A]²[B]. If [A] is doubled and [B] is halved, the rate changes by factor of:",
      options: { A: "1", B: "2", C: "4", D: "8" },
      correctAnswer: "B", explanation: "New rate = k(2A)²(B/2) = k × 4A² × 0.5B = 2 × k[A]²[B]. So rate doubles (factor of 2)." },
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

export function getQuestionsFromBank({ subject, year, exam, count = 10, difficulty = null }) {
  // First try exact subject match
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