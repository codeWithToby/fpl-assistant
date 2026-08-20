import { describe, expect, it } from "vitest";
import { isNearDeadline } from "./fetchBootstrap";
import type { BootstrapData, GameweekEvent } from "./types";

function bootstrapWithEvents(events: GameweekEvent[]): BootstrapData {
  return { players: [], teams: [], events, elementTypes: [] };
}

function eventAt(overrides: Partial<GameweekEvent> = {}): GameweekEvent {
  return {
    id: 1,
    name: "Gameweek 1",
    isCurrent: false,
    isNext: true,
    finished: false,
    deadlineTime: new Date().toISOString(),
    ...overrides,
  };
}

const HOUR_MS = 60 * 60 * 1000;

describe("isNearDeadline", () => {
  it("is false with no gameweek to plan around at all", () => {
    expect(isNearDeadline(bootstrapWithEvents([]))).toBe(false);
  });

  it("is false when the deadline is well over 2 hours away", () => {
    const deadline = new Date(Date.now() + 5 * HOUR_MS).toISOString();
    const bootstrap = bootstrapWithEvents([eventAt({ deadlineTime: deadline })]);
    expect(isNearDeadline(bootstrap)).toBe(false);
  });

  it("is true when the deadline is within the next 2 hours", () => {
    const deadline = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min out
    const bootstrap = bootstrapWithEvents([eventAt({ deadlineTime: deadline })]);
    expect(isNearDeadline(bootstrap)).toBe(true);
  });

  it("is false once the deadline has already passed", () => {
    const deadline = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 min ago
    const bootstrap = bootstrapWithEvents([eventAt({ deadlineTime: deadline })]);
    expect(isNearDeadline(bootstrap)).toBe(false);
  });

  it("uses the next gameweek's deadline, not a finished one's", () => {
    const passedDeadline = new Date(Date.now() - HOUR_MS).toISOString();
    const upcomingDeadline = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const bootstrap = bootstrapWithEvents([
      eventAt({ id: 1, isCurrent: false, isNext: false, finished: true, deadlineTime: passedDeadline }),
      eventAt({ id: 2, isCurrent: true, isNext: true, finished: false, deadlineTime: upcomingDeadline }),
    ]);
    expect(isNearDeadline(bootstrap)).toBe(true);
  });
});
