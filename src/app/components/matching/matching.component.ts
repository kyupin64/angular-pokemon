import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { CurrentGame } from '../../interfaces/current-game';
import { GameService } from '../../services/game.service';
import { Player } from '../../interfaces/player';
import { CurrentGameCard } from '../../interfaces/current-game-card';

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
  currentGame$: CurrentGame | null = null;
  status: string = "";
  turn: string = "";
  round: number;
  matchesRemaining: number;
  players: Array<Player> = [];
  cards: Array<CurrentGameCard> = [];

  numCardsRevealed: number = 0;
  revealedCard: any | null;
  loadingGame: boolean = true;
  gameSubscription;

  constructor(
    private gameService: GameService
  ) { }

  ngOnInit() {
    this.gameSubscription = this.gameService.getCurrentGame().subscribe((currentGame) => {
      if (currentGame) {
        this.currentGame$ = currentGame;
        this.status = currentGame.status;
        this.turn = currentGame.turn;
        this.round = currentGame.round;
        this.matchesRemaining = currentGame.matchesRemaining;
        this.players = currentGame.players;
        this.initializeCards(currentGame.cards);
      }
    });
  }

  ngOnDestroy() {
    // unsubscribe to avoid memory leaks
    if (this.gameSubscription) {
      this.gameSubscription.unsubscribe();
    }
  }

  async initializeCards(currentGameCards) {
    // wait for cards to be initialized
    await this.waitForCards();
    this.cards = currentGameCards;

    this.status = "in-progress";
    this.updateCurrentGame();

    this.loadingGame = false;
  }

  async waitForCards() {
    const startTime = Date.now();

    while (!this.currentGame$.cards[0]) {
      if (Date.now() - startTime > 10000) {
        throw new Error('Timeout exceeded');
      }
  
      await new Promise(resolve => setTimeout(resolve, 100));
    }
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
        }
      }
    }
  }

  ifMatchFound(card: any) {
    console.log("congrats! you found a match!"); // placeholder

    // wait two seconds then set found to true on both cards, reset cards, and add point
    setTimeout(() => {
      card.found = true;
      this.revealedCard.found = true;
      card.playerFoundId = this.currentGame$.turn;
      this.revealedCard.playerFoundId = this.currentGame$.turn;
      this.revealedCard = null;
      this.numCardsRevealed = 0;
      this.matchesRemaining -= 1;

      // update player points
      const player = this.players.find(p => p.uid === this.currentGame$.turn);
      if (player) player.points += 1;

      this.updateCurrentGame();

      // check if that was the last match, and if so, end the game
      if (this.currentGame$.matchesRemaining === 0) {
        this.endGame();
      }
    }, 2000);
  }

  endGame() {
    // place each player based on points
    this.players.sort((a, b) => b.points - a.points);

    let currentPlace = 1;
    for (let i = 0; i < this.players.length; i++) {
      // if it's not the first player and their points are the same as the previous player, they get the same place
      if (i > 0 && this.players[i].points === this.players[i - 1].points) {
        this.players[i].place = this.players[i - 1].place;
      } else {
        this.players[i].place = currentPlace;
      }

      currentPlace++;
    }

    this.status = "finished";
    this.updateCurrentGame();
  }

  ifNoMatchFound(card: any) {
    console.log('no match found'); // placeholder

    // wait two seconds then hide both cards again, reset turn info, and switch to the next player's turn/next round
    setTimeout(() => {
      card.revealed = false;
      this.revealedCard.revealed = false;
      this.revealedCard = null;
      this.numCardsRevealed = 0;

      // if one player, switch to next round
      if (this.players.length === 1) {
        this.round += 1;

      // if multiple players and it's the last player's turn, switch to next round and set turn to first player
      } else if (this.currentGame$.turn === this.players[this.players.length - 1].uid) {
        this.round += 1;
        this.turn = this.players[0].uid;

      // if multiple players and not last player's turn, switch to next player's turn
      } else {
        for (let i = 0; i < this.players.length; i++) {
          if (this.currentGame$.turn === this.players[i].uid) {
            this.turn = this.players[i + 1].uid;
            return;
          }
        }
      }

      this.updateCurrentGame();
    }, 2000);
  }

  updateCurrentGame() {
    const updatedGame: CurrentGame = { 
      ...this.currentGame$, 
      cards: this.cards, 
      players: this.players,
      status: this.status,
      turn: this.turn,
      round: this.round,
      matchesRemaining: this.matchesRemaining
    };

    // prevent infinite loops
    if (JSON.stringify(updatedGame) !== JSON.stringify(this.currentGame$)) {
      this.gameService.saveGame(updatedGame);
    }
  }
}
