// lib/sm2.ts

export type ReviewRating = "AGAIN" | "HARD" | "GOOD" | "EASY";

export interface SM2State {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
}

export interface SM2Result extends SM2State {
  dueAt: Date;
}

/**
 * SM-2 spaced repetition algorithm.
 * Given a card's current state and how well you remembered it,
 * returns the updated state (and when it's next due).
 */
export function calculateNextReview(
  current: SM2State,
  rating: ReviewRating,
): SM2Result {
  let { easeFactor, intervalDays, repetitions } = current;

  if (rating === "AGAIN") {
    // Forgot it — restart the schedule, but don't punish easeFactor too harshly.
    repetitions = 0;
    intervalDays = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else {
    // Remembered it — advance the schedule.
    repetitions += 1;

    if (repetitions === 1) {
      intervalDays = 1;
    } else if (repetitions === 2) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }

    // Nudge ease factor based on how easy it felt.
    const easeDelta = { HARD: -0.15, GOOD: 0, EASY: 0.15 }[rating];
    easeFactor = Math.max(1.3, easeFactor + easeDelta);
  }

  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + intervalDays);

  return { easeFactor, intervalDays, repetitions, dueAt };
}