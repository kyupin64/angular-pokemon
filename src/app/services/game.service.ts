import { Injectable } from '@angular/core';

import { CurrentGame } from '../interfaces/current-game';
import { CurrentGameCard } from '../interfaces/current-game-card';

import { CardsService } from './cards.service';
import { UsersService } from './users.service';
import { BehaviorSubject } from 'rxjs';
import { Player } from '../interfaces/player';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private currentGame = new BehaviorSubject<CurrentGame | null>(null);
  players: Array<Player | null> = [];
  randomCards: Array<CurrentGameCard> = [];
  ids: Array<string> = [];

  constructor(
    private cardsService: CardsService,
    private usersService: UsersService,
    private db: Firestore
  ) {
    // check localStorage on initialization
    const gameData = localStorage.getItem('game');
    if (gameData) {
      const game: CurrentGame = JSON.parse(gameData);
      this.currentGame.next(game);
    }
  }

  getCurrentGame() {
    return this.currentGame.asObservable();
  }

  async createNewGame(matchesNum: number, cardSet: string, playerUsers: Array<string>): Promise<boolean> {
    //reset current game
    this.currentGame.next(null);
    this.players = [];
    this.randomCards = [];
    this.ids = [];

    // get cards and determine which cards are used for matching
    const cards = await this.cardsService.getAllCardsInSet(cardSet);
    this.getRandomCards(cards, matchesNum);

    // convert player usernames to Player objects
    await this.getPlayers(playerUsers);

    // placeholder: get random number for id
    const rngId = '0' + (Math.round(Math.random() * 1000000)).toString();
    this.ids.push(rngId);

    // add all info to newGame object
    const newGame: CurrentGame = ({
      id: this.ids[0],
      hostId: this.players[0].uid,
      cardSetId: cardSet,
      cards: this.randomCards,
      players: this.players,
      turn: this.players[0].uid,
      matchesRemaining: matchesNum,
      round: 1,
      status: 'created',
      createdAt: new Date(),
      lastUpdated: null
    });

    this.saveGame(newGame);
    return true;
  }

  getRandomCards(cards: Array<CurrentGameCard>, matchesNum: number) {
    // check if there are enough unique cards to match the number of matches
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
      if (this.randomCards.length < matchesNum * 2) {
        this.randomCards.push(card);
        this.randomCards.push({ ...card }); // add duplicate so there are 2 of each card
      } else {
        return
      }
    });

    // shuffle cards so they're in a unique order
    this.randomCards = this.cardsService.shuffleCards(this.randomCards);
  }

  async getPlayers(players: Array<string>) {
    // convert player usernames to User objects and add to players array
    const userPromises = players.map(async (username, index) => {
      if (username) {
        const currentPlayer = await this.usersService.getUserWithUsername(username);
        this.players[index] = {
          uid: currentPlayer.uid,
          username: currentPlayer.username,
          points: 0,
          place: 0
        };

      } else {
        this.players[index] = null;
      }
    });

    await Promise.all(userPromises);
  }

  async saveGame(game) {
    // add the item to localStorage, set currentGame to the new/updated game, and add to firestore
    localStorage.setItem('game', JSON.stringify(game));
    this.currentGame.next(game);

    const gameRef = doc(this.db, 'games', game.id);
    await setDoc(gameRef, { ...game, lastUpdated: new Date() }, { merge: true });
  }
}
