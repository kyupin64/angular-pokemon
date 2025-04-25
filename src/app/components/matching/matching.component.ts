import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { MatCardModule } from '@angular/material/card';

import { Player } from '../../interfaces/player';
import { CurrentGameCard } from '../../interfaces/current-game-card';

import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-matching',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './matching.component.html',
  styleUrl: './matching.component.css'
})
export class MatchingComponent {
  status: string = "";
  turn: string = "";
  round: number;
  matchesRemaining: number;
  players: Array<Player> = [];
  cards: Array<CurrentGameCard> = [];

  numCardsRevealed: number = 0;
  revealedCard: any | null;
  loadingGame: boolean = true;
  gameSubscription: Subscription;

  constructor(
    private gameService: GameService
  ) { }

  ngOnInit() {
    this.gameSubscription = this.gameService.getCurrentGame().subscribe((currentGame) => {
      if (currentGame) {
        this.status = currentGame.status;
        this.turn = currentGame.turn;
        this.round = currentGame.round;
        this.matchesRemaining = currentGame.matchesRemaining;
        this.players = structuredClone(currentGame.players);

        if (currentGame.status === "in-progress") {
          this.cards = structuredClone(currentGame.cards)
        };

        if (this.loadingGame) this.loadingGame = false;
      };
    });
  }

  ngOnDestroy() {
    // unsubscribe to avoid memory leaks
    if (this.gameSubscription) {
      this.gameSubscription.unsubscribe();
    };
  }

  isPlayerTurn(playerId: string): boolean {
    return this.turn === playerId;
  }

  revealCard(card: any): void {
    // if the card clicked hasn't already been found (matched) and there isn't already 2 cards revealed, show the card and set the next card to end the turn
    if (!card.found && this.numCardsRevealed < 2) {
      this.numCardsRevealed += 1;
      card.revealed = true;

      // if this is the first card the player has revealed, save card info
      if (this.numCardsRevealed === 1) {
        this.revealedCard = card;

      // if this is the second card revealed, check whether there's a match
      } else {
        if (this.revealedCard.id === card.id) {
          this.ifMatchFound(card);
        } else {
          this.ifNoMatchFound(card);
        };
      };
    };
  }

  ifMatchFound(card: any) {
    console.log("congrats! you found a match!"); // placeholder

    // update cards found and player points, reset revealed cards
    this.gameService.matchFound(card.id);
    this.revealedCard = null;
    this.numCardsRevealed = 0;

    // wait two seconds then check if it's the end of the game
    setTimeout(() => {
      if (this.matchesRemaining === 0) {
        this.gameService.endGame();
      }
    }, 2000);
  }

  ifNoMatchFound(card: any) {
    console.log('no match found'); // placeholder

    setTimeout(() => {
      this.gameService.advanceTurn();

      card.revealed = false;
      this.revealedCard.revealed = false;
      this.revealedCard = null;
      this.numCardsRevealed = 0;
    }, 2000);
  }
}
