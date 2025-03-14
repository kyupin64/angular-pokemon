import { CurrentGameCard } from "./current-game-card";
import { User } from "./user";

export interface CurrentGame {
    cardSetId: string,
    cards: Array<CurrentGameCard>,
    players: Array<User>,
    turn: User,
    matchesRemaining: number,
    round: number
}
