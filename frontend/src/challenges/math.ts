// Math challenge equation generator. Alternates medium and hard difficulty
// per the user spec, hard enough to keep older kids honest but never an
// actual math olympiad. Each call to `generateChallenge(n)` returns a fresh
// list of `n` equations (paired with their answers) so we can show progress.
//
// "Medium": single-digit × single-digit or 2-digit ± 2-digit.
// "Hard":   2-digit × single-digit, 3-digit ± 3-digit, simple division
//           with whole-number results.

export type Difficulty = "medium" | "hard";

export interface Equation {
  id: string;
  expression: string; // e.g. "12 × 7"
  answer: number;
  difficulty: Difficulty;
}

const randInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const newId = (): string =>
  Math.random().toString(36).slice(2, 8);

const mediumEquation = (): Equation => {
  // Pick between 1-digit × 1-digit, 2-digit + 2-digit, 2-digit - 2-digit.
  const kind = randInt(0, 2);
  if (kind === 0) {
    const a = randInt(2, 9);
    const b = randInt(2, 9);
    return {
      id: newId(),
      expression: `${a} × ${b}`,
      answer: a * b,
      difficulty: "medium",
    };
  }
  if (kind === 1) {
    const a = randInt(10, 49);
    const b = randInt(10, 49);
    return {
      id: newId(),
      expression: `${a} + ${b}`,
      answer: a + b,
      difficulty: "medium",
    };
  }
  // Guarantee non-negative result for subtraction.
  const a = randInt(20, 80);
  const b = randInt(10, a - 1);
  return {
    id: newId(),
    expression: `${a} − ${b}`,
    answer: a - b,
    difficulty: "medium",
  };
};

const hardEquation = (): Equation => {
  // 2-digit × 1-digit, 3-digit ± 2-digit, integer division.
  const kind = randInt(0, 2);
  if (kind === 0) {
    const a = randInt(11, 25);
    const b = randInt(3, 9);
    return {
      id: newId(),
      expression: `${a} × ${b}`,
      answer: a * b,
      difficulty: "hard",
    };
  }
  if (kind === 1) {
    const a = randInt(120, 480);
    const b = randInt(20, 90);
    const plus = Math.random() < 0.5;
    return {
      id: newId(),
      expression: `${a} ${plus ? "+" : "−"} ${b}`,
      answer: plus ? a + b : a - b,
      difficulty: "hard",
    };
  }
  // Integer division with whole result.
  const b = randInt(3, 9);
  const result = randInt(4, 19);
  const a = b * result;
  return {
    id: newId(),
    expression: `${a} ÷ ${b}`,
    answer: result,
    difficulty: "hard",
  };
};

/**
 * Build a fresh sequence of `count` equations alternating medium ↔ hard.
 * Starts on medium so the first question feels approachable.
 */
export function generateChallenge(count: number = 3): Equation[] {
  return Array.from({ length: count }, (_, i) =>
    i % 2 === 0 ? mediumEquation() : hardEquation(),
  );
}

/**
 * Replace a single slot — used when the user gets one wrong and we want to
 * "reshuffle" with a fresh equation of the same difficulty (per spec: no
 * streak reset, just a new question).
 */
export function reshuffleAt(
  equations: Equation[],
  index: number,
): Equation[] {
  const next = [...equations];
  next[index] =
    equations[index].difficulty === "hard"
      ? hardEquation()
      : mediumEquation();
  return next;
}
