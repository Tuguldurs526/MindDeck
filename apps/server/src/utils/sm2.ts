export type Rating = "again" | "hard" | "good" | "easy";

export interface SM2State {
  repetition: number;
  interval: number; // days
  efactor: number;
}

export function nextSM2(state: SM2State, rating: Rating): SM2State & { quality: number } {
  // map 4 buttons to Anki-like quality (0..5)
  const q = rating === "again" ? 0 : rating === "hard" ? 3 : rating === "good" ? 4 : 5;

  let E = Math.max(1.3, state.efactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  let rep = state.repetition;
  let I = state.interval;

  if (q < 3) {
    rep = 0;
    I = 1;
  } else {
    rep = rep + 1;
    if (rep === 1) I = 1;
    else if (rep === 2) I = 6;
    else I = Math.round(I * E);
  }

  return { repetition: rep, interval: I, efactor: E, quality: q };
}



