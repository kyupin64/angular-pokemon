import { Injectable } from '@angular/core';

import { CurrentGame } from '../interfaces/current-game';
import { User } from '../interfaces/user';
import { CurrentGameCard } from '../interfaces/current-game-card';

import { CardsService } from './cards.service';
import { UsersService } from './users.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  currentGame: CurrentGame;
  playerUsers: Array<User | null> = [];
  randomCards: Array<CurrentGameCard> = [];
  turn: User;

  constructor(
    private cardsService: CardsService,
    private usersService: UsersService
  ) { }

  async createNewGame(matchesNum: number, cardSet: string, players: Array<string>): Promise<boolean> {
    // subscribe to getAllCardsInSet and determine which cards are used for matching
    this.cardsService.getAllCardsInSet(cardSet).subscribe(cards => {
      this.getRandomCards(cards, matchesNum);
    })

    // convert player useernames to User objects
    await this.getPlayersAsUsers(players);

    // add all info to currentGame object
    this.currentGame = {
      cardSetId: cardSet,
      cards: this.randomCards,
      player1: this.playerUsers[0] ? this.playerUsers[0] : null,
      player2: this.playerUsers[1] ? this.playerUsers[1] : null,
      player3: this.playerUsers[2] ? this.playerUsers[2] : null,
      player4: this.playerUsers[3] ? this.playerUsers[3] : null,
      turn: this.turn,
      totalMatches: matchesNum,
      round: 1
    }

    return true;
  }

  getRandomCards(cards: Array<CurrentGameCard>, matchesNum: number) {
    // check if there's enough unique cards to match the number of matches
    if (matchesNum > cards.length) {
        throw new Error('Not enough unique cards to create the requested number of matches.');
    }

    let randomCardSet = new Set<CurrentGameCard>(); // use Set to avoid duplicates
    while (randomCardSet.size < matchesNum) {
        // get random numbers between 1 and the length of cards in set (amount equal to selected number of matches)
        const rng = Math.floor(Math.random() * cards.length);
        randomCardSet.add(cards[rng]);
    }

    // add each random card to randomCards array
    randomCardSet.forEach(card => {
      if (this.currentGame.cards.length < matchesNum) {
        this.randomCards.push(card);
      } else {
        return
      }
    });
  }

  async getPlayersAsUsers(players: Array<string>) {
    // Convert player usernames to User objects and add to playerUsers array
    const userPromises = players.map(async (username, index) => {
      if (username) {
        const currentPlayer = await this.usersService.getUserWithUsername(username);
        this.playerUsers[index] = currentPlayer;

        if (index === 0) {
          this.turn = currentPlayer; // Player 1 gets the first turn
        }
      } else {
        this.playerUsers[index] = null;
      }
    });

    await Promise.all(userPromises);
  }
}
