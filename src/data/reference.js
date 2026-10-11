// Educational reference sheets: formula tables, constants, grammar rules.
// Rendered as spreadsheet-style data tables in ReferencePage.
export const REFERENCE_SHEETS = [
  {
    id: "maths",
    title: "Mathematics Formulas",
    emoji: "📐",
    groups: [
      {
        name: "Algebra",
        rows: [
          ["Quadratic roots", "x = (−b ± √(b²−4ac)) / 2a"],
          ["Difference of squares", "a² − b² = (a−b)(a+b)"],
          ["(a+b)²", "a² + 2ab + b²"],
          ["Laws of indices", "aᵐ·aⁿ = aᵐ⁺ⁿ · aᵐ/aⁿ = aᵐ⁻ⁿ · (aᵐ)ⁿ = aᵐⁿ"],
          ["Log rules", "log(ab) = log a + log b · log(a/b) = log a − log b · log aⁿ = n·log a"],
          ["Arithmetic progression", "Tₙ = a + (n−1)d · Sₙ = n/2 (2a + (n−1)d)"],
          ["Geometric progression", "Tₙ = arⁿ⁻¹ · Sₙ = a(rⁿ−1)/(r−1)"],
        ],
      },
      {
        name: "Trigonometry",
        rows: [
          ["SOH-CAH-TOA", "sin=opp/hyp · cos=adj/hyp · tan=opp/adj"],
          ["Pythagoras", "sin²θ + cos²θ = 1"],
          ["Special angles", "sin30=½ · cos60=½ · tan45=1 · sin60=cos30=√3/2"],
          ["Sine rule", "a/sinA = b/sinB = c/sinC"],
          ["Cosine rule", "c² = a² + b² − 2ab·cosC"],
        ],
      },
      {
        name: "Geometry & Mensuration",
        rows: [
          ["Circle", "Area = πr² · Circumference = 2πr"],
          ["Triangle", "Area = ½·base·height"],
          ["Trapezium", "Area = ½·(a+b)·h"],
          ["Cylinder", "Volume = πr²h · Curved area = 2πrh"],
          ["Sphere", "Volume = ⁴⁄₃πr³ · Surface = 4πr²"],
          ["Cone", "Volume = ⅓πr²h"],
          ["Interior angles", "(n−2) × 180°"],
        ],
      },
      {
        name: "Statistics",
        rows: [
          ["Mean", "Σx / n"],
          ["Median", "Middle value (ordered data)"],
          ["Mode", "Most frequent value"],
          ["Range", "Max − min"],
          ["Probability", "Favourable outcomes / total outcomes"],
        ],
      },
    ],
  },
  {
    id: "physics",
    title: "Physics Formulas & Constants",
    emoji: "⚛️",
    groups: [
      {
        name: "Mechanics",
        rows: [
          ["Speed / Velocity", "v = s/t · a = (v−u)/t"],
          ["Equations of motion", "v = u+at · s = ut+½at² · v² = u²+2as"],
          ["Force", "F = ma (Newton, N)"],
          ["Weight", "W = mg (g = 10 m/s²)"],
          ["Work / Energy", "W = F·s · KE = ½mv² · PE = mgh (Joule, J)"],
          ["Power", "P = W/t (Watt, W)"],
          ["Pressure", "P = F/A (Pascal, Pa)"],
          ["Density", "ρ = m/V"],
        ],
      },
      {
        name: "Electricity",
        rows: [
          ["Ohm's law", "V = IR"],
          ["Series resistance", "R = R₁ + R₂ + …"],
          ["Parallel (2)", "R = (R₁·R₂)/(R₁+R₂)"],
          ["Power", "P = VI = I²R = V²/R"],
          ["Energy (kWh)", "E = P(kW) × t(h)"],
          ["Charge", "Q = It (Coulomb, C)"],
        ],
      },
      {
        name: "Waves & Light",
        rows: [
          ["Wave equation", "v = fλ"],
          ["Refraction", "Light bends dense↔rare (Snell's law)"],
          ["Echo distance", "d = (v·t)/2"],
          ["Electromagnetic speed", "3 × 10⁸ m/s in vacuum"],
        ],
      },
      {
        name: "Key Constants",
        rows: [
          ["g (gravity)", "10 m/s²"],
          ["Speed of light", "3.0 × 10⁸ m/s"],
          ["Speed of sound (air)", "≈ 340 m/s"],
          ["Charge of electron", "1.6 × 10⁻¹⁹ C"],
        ],
      },
    ],
  },
  {
    id: "chemistry",
    title: "Chemistry Essentials",
    emoji: "🧪",
    groups: [
      {
        name: "First 20 Elements",
        rows: [
          ["1 H Hydrogen", "1"], ["2 He Helium", "2"], ["3 Li Lithium", "2,1"], ["4 Be Beryllium", "2,2"],
          ["5 B Boron", "2,3"], ["6 C Carbon", "2,4"], ["7 N Nitrogen", "2,5"], ["8 O Oxygen", "2,6"],
          ["9 F Fluorine", "2,7"], ["10 Ne Neon", "2,8"], ["11 Na Sodium", "2,8,1"], ["12 Mg Magnesium", "2,8,2"],
          ["13 Al Aluminium", "2,8,3"], ["14 Si Silicon", "2,8,4"], ["15 P Phosphorus", "2,8,5"],
          ["16 S Sulphur", "2,8,6"], ["17 Cl Chlorine", "2,8,7"], ["18 Ar Argon", "2,8,8"],
          ["19 K Potassium", "2,8,8,1"], ["20 Ca Calcium", "2,8,8,2"],
        ],
      },
      {
        name: "Common Ions & Formulae",
        rows: [
          ["Water", "H₂O"], ["Carbon dioxide", "CO₂"], ["Ammonia", "NH₃"],
          ["Sulphuric acid", "H₂SO₄"], ["Hydrochloric acid", "HCl"], ["Sodium hydroxide", "NaOH"],
          ["Calcium carbonate", "CaCO₃"], ["Methane", "CH₄"], ["Ethanol", "C₂H₅OH"],
          ["Table salt", "NaCl"], ["Washing soda", "Na₂CO₃·10H₂O"],
        ],
      },
      {
        name: "Quick Calculations",
        rows: [
          ["Moles", "n = mass / molar mass"],
          ["Molarity", "M = moles / volume(dm³)"],
          ["pH", "pH = −log[H⁺]"],
          ["% yield", "(actual / theoretical) × 100"],
          ["Avogadro's number", "6.02 × 10²³"],
        ],
      },
    ],
  },
  {
    id: "english",
    title: "English Rules & Tables",
    emoji: "📖",
    groups: [
      {
        name: "12 Tenses (with examples)",
        rows: [
          ["Simple present", "She writes daily."],
          ["Present continuous", "She is writing now."],
          ["Present perfect", "She has written twice."],
          ["Simple past", "She wrote yesterday."],
          ["Past continuous", "She was writing at noon."],
          ["Past perfect", "She had written before lunch."],
          ["Simple future", "She will write tomorrow."],
          ["Future continuous", "She will be writing at 8pm."],
          ["Future perfect", "She will have written by Friday."],
        ],
      },
      {
        name: "Concord (Subject-Verb Agreement)",
        rows: [
          ["Each / every / neither", "Singular verb → 'Each student has…'"],
          ["Neither…nor / either…or", "Verb agrees with nearer subject"],
          ["'Along with / as well as'", "Ignore the phrase — verb follows main subject"],
          ["'The number of'", "Singular → 'The number is…'"],
          ["'A number of'", "Plural → 'A number are…'"],
          ["News / mathematics", "Singular despite -s → 'The news is…'"],
        ],
      },
      {
        name: "Commonly Confused Words",
        rows: [
          ["Accept / Except", "Receive / Excluding"],
          ["Affect / Effect", "Verb (influence) / Noun (result)"],
          ["Compliment / Complement", "Praise / Complete"],
          ["Principal / Principle", "Head or sum / Rule"],
          ["Stationary / Stationery", "Not moving / Writing materials"],
          ["Their / There / They're", "Possession / Place / They are"],
        ],
      },
    ],
  },
  {
    id: "biology",
    title: "Biology Key Facts",
    emoji: "🧬",
    groups: [
      {
        name: "Must-Know Definitions",
        rows: [
          ["Photosynthesis", "6CO₂ + 6H₂O →(light) C₆H₁₂O₆ + 6O₂ (in chloroplasts)"],
          ["Respiration", "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy"],
          ["Osmosis", "Water movement across a semi-permeable membrane"],
          ["Mitosis", "Cell division producing 2 identical cells"],
          ["Meiosis", "Division producing 4 gametes (half chromosomes)"],
        ],
      },
      {
        name: "Human Body Numbers",
        rows: [
          ["Chromosomes", "46 (23 pairs)"],
          ["Bones (adult)", "206"],
          ["Normal body temp", "37 °C"],
          ["Blood groups", "A, B, AB, O (donor: O · receiver: AB)"],
          ["Chambers of heart", "4 (2 atria, 2 ventricles)"],
        ],
      },
    ],
  },
];
