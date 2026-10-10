/** Watch rooms (src/net/spectate.ts) are named by a watch code; kept apart so presence can check one cheaply. */
const WATCH_CODE = /^W[A-Z0-9-]{3,23}$/;

/** A watch code (as published in presence and shown in tournaments) is the watch room's name. */
export function isWatchCode(code: unknown): code is string {
  return typeof code === 'string' && WATCH_CODE.test(code);
}

/** The watch room of an online match's room (both players can name it). */
export const matchWatchCode = (room: string) => `W${room}`;
/** The watch room of a tournament match, whoever hosts it (a bot match is hosted by its player). */
export const tournamentWatchCode = (tournamentCode: string, matchId: string) => matchWatchCode(`T${tournamentCode}${matchId}`);
