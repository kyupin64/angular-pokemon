import { CurrentGameCard } from "./current-game-card";
import { User } from "./user";

export interface CurrentGame {
    cardSetId: string,
    cards: Array<CurrentGameCard>,
    player1: User | null,
    player2: User | null,
    player3: User | null,
    player4: User | null,
    turn: User,
    totalMatches: number,
    round: number
}
