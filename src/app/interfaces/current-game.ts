import { CurrentGameCard } from "./current-game-card";
import { Player } from "./player";

export interface CurrentGame {
    cardSetId: string,
    cards: Array<CurrentGameCard>,
    players: Array<Player>,
    turn: Player,
    matchesRemaining: number,
    round: number
}
