// apps/server/src/utils/srs.ts
// Minimal, standard SM-2 scheduler with sane defaults.
// Quality: 0..5. If q < 3 => reset.
// Stored state fields: reps, interval (days), ef (ease factor), due (Date)

export type SM2State = {
  reps: number; // consecutive correct reviews
  interval: number; // days
  ef: number; // ease factor
  due: Date; // next review date
};

export function sm2Next(state: SM2State, quality: number): SM2State {
  const clampQ = Math.max(0, Math.min(5, Math.floor(quality)));

  // always work on a copy
  let { reps, interval, ef } = state;

  if (clampQ < 3) {
    // failure: reset
    reps = 0;
    interval = 1;
  } else {
    // success: update reps
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 6;
    else interval = Math.round(interval * ef);
  }

  // update ease factor (SuperMemo-2)
  // EF':= EF + (0.1 - (5 - q)*(0.08 + (5 - q)*0.02))
  ef = ef + (0.1 - (5 - clampQ) * (0.08 + (5 - clampQ) * 0.02));
  if (ef < 1.3) ef = 1.3; // floor recommended by SM-2

  const due = addDays(new Date(), Math.max(1, interval));

  return { reps, interval, ef, due };
}

export function initialSM2(): SM2State {
  return {
    reps: 0,
    interval: 0,
    ef: 2.5,
    due: new Date(), // eligible now
  };
}

function addDays(d: Date, days: number) {
  const copy = new Date(d.getTime());
  copy.setDate(copy.getDate() + days);
  return copy;
}



