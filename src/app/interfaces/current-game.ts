import { CurrentGameCard } from "./current-game-card";
import { Player } from "./player";

export interface CurrentGame {
    id: string,
    hostId: string,
    cardSetId: string,
    cards: Array<CurrentGameCard>,
    players: Array<Player>,
    turn: string,
    matchesRemaining: number,
    round: number,
    status: string,
    createdAt: Date ,
    lastUpdated: Date
}
