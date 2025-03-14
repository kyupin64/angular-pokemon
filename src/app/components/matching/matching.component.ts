import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { CurrentGame } from '../../interfaces/current-game';
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
  currentGame$: CurrentGame | null = null;
  players: Array<any> = [];
  cards: Array<any> = [];

  numCardsRevealed: number = 0;
  revealedCard: any | null;
  loadingGame: boolean = true;
  gameFinished: boolean = false;

  constructor(
    private gameService: GameService
  ) { }

  ngOnInit() {
    this.gameService.getCurrentGame().subscribe((currentGame) => {
      if (currentGame) {
        this.currentGame$ = currentGame;
        this.players = this.initializePlayers(currentGame.players);
        this.initializeCards(currentGame.cards);
      }
    });
  }

  async initializeCards(currentGameCards) {
    // wait for cards to be initialized
    await this.waitForCards();
    this.cards = currentGameCards;
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

  initializePlayers(currentGamePlayers) {
    // create array to store players
    let playersArr = [];
    for (let i = 0; i < 4; i++) {
      const player = currentGamePlayers[i];
      if (player) {
        playersArr.push({ ...player, points: 0})
      }
    }

    return playersArr;
  }

  isPlayerTurn(playerId: string): boolean {
    return this.currentGame$.turn?.uid === playerId;
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
      card.playerFound = this.currentGame$.turn;
      this.revealedCard.playerFound = this.currentGame$.turn;
      this.revealedCard = null;
      this.numCardsRevealed = 0;
      this.currentGame$.matchesRemaining -= 1;

      // update player points
      const player = this.players.find(p => p.uid === this.currentGame$.turn.uid);
      if (player) player.points += 1;

      // check if that was the last match, and if so, end the game
      if (this.currentGame$.matchesRemaining === 0) {
        this.endGame();
      }
    }, 2000);
  }

  endGame() {
    this.gameFinished = true;
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
        this.currentGame$.round += 1;

      // if multiple players and it's the last player's turn, switch to next round and set turn to first player
      } else if (this.currentGame$.turn.uid === this.players[this.players.length - 1].uid) {
        this.currentGame$.round += 1;
        this.currentGame$.turn = this.players[0];

      // if multiple players and not last player's turn, switch to next player's turn
      } else {
        for (let i = 0; i < this.players.length; i++) {
          if (this.currentGame$.turn.uid === this.players[i].uid) {
            this.currentGame$.turn = this.players[i + 1];
            return;
          }
        }
      }
    }, 2000);
  }
}
