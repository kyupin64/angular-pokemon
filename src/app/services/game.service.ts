import { Injectable } from '@angular/core';
import { collection, doc, Firestore, getDocs, limit, query, setDoc, where } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

import { CurrentGame } from '../interfaces/current-game';
import { CurrentGameCard } from '../interfaces/current-game-card';
import { Player } from '../interfaces/player';

import { CardsService } from './cards.service';
import { UsersService } from './users.service';
import { LoginService } from './login.service';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private currentGame = new BehaviorSubject<CurrentGame | null>(null);
  currentUser: User | null = null;

  constructor(
    private cardsService: CardsService,
    private usersService: UsersService,
    private loginService: LoginService,
    private db: Firestore
  ) {
    this.loginService.getLoggedInBool().subscribe((loggedIn) => {
      if (loggedIn) {
        this.init(); // wait until user logs in to manually initialize
      };
    });
  }

  getCurrentGame() {
    return this.currentGame.asObservable();
  }

  init() {
    // subscribe to getCurrentUser, set currentUser to user, and find current game
    const userSubscription = this.loginService.getCurrentUser().subscribe((user) => {
      if (user) {
        this.currentUser = user;
        if (user.currentGame) {
          this.findGame(user.currentGame);
        };
      };
    });
    // unsubscribe to avoid memory leaks
    userSubscription.unsubscribe();
  }

  async findGame(gameId) {
    try {
      // find game in firestore games collection
      const gamesCollection = collection(this.db, 'games');
      const q = query(gamesCollection, where('id', '==', gameId));
      const querySnapshot = await getDocs(q);

      let foundGame;
      querySnapshot.forEach((doc,) => {
        foundGame = doc.data();
      }, limit(1));

      // if game exists, set currentGame to foundGame
      if (foundGame) {
        this.currentGame.next(foundGame);
      } else {
        return 'no game found';
      };
    } catch (error) {
      const errorCode = error.code;
      return error.message;
    };
  }

  async createNewGame(matchesNum: number, cardSet: string, playerUsers: Array<string>): Promise<boolean> {
    try {
      // get cards, players, and game id (placeholder)
      const cards: Array<CurrentGameCard> | null = await this.cardsService.getRandomCards(cardSet, matchesNum);
      const players: Array<Player> | null = await this.usersService.getPlayers(playerUsers);
      const id: string = '0000' + (Math.round(Math.random() * 1000000)).toString(); // placeholder
  
      // add all info to newGame object
      const newGame: CurrentGame = ({
        id: id,
        hostId: players[0].uid,
        cardSetId: cardSet,
        cards: cards,
        players: players,
        turn: players[0].uid,
        matchesRemaining: matchesNum,
        round: 1,
        status: 'in-progress',
        createdAt: new Date(),
        lastUpdated: null
      });
  
      await this.saveGame(newGame);
      await this.loginService.updateCurrentUser({ ...this.currentUser, currentGame: id });
  
      return true;
    } catch (err) {
      console.error("Failed to create game", err);
      return false;
    };
  }

  async matchFound(cardId: string) {
    const game = structuredClone(this.currentGame.value);
    if (!game) return;
  
    // map through cards and players to mark cards as found and add a point
    game.cards = game.cards.map(card =>
      card.id === cardId ? { ...card, found: true, playerFoundId: game.turn, revealed: true } : card
    );
    game.players = game.players.map(player =>
      player.uid === game.turn ? { ...player, points: player.points + 1 } : player
    );
    game.matchesRemaining -= 1;
    
    await this.saveGame(game);
  }
  
  async advanceTurn() {
    const game = structuredClone(this.currentGame.value);
    if (!game) return;
  
    const players = game.players.filter(Boolean);
    const currentIndex = game.players.findIndex(p => p.uid === game.turn);
  
    // if one player, switch to next round
    if (players.length === 1) {
      game.round += 1;
    // if multiple players and it's the last player's turn, switch to next round and set turn to first player
    } else if (currentIndex === players.length - 1) {
      game.round += 1;
      game.turn = players[0].uid;
    // if multiple players and not last player's turn, switch to next player's turn
    } else {
      game.turn = players[currentIndex + 1].uid;
    };
  
    await this.saveGame(game);
  }
  
  async endGame() {
    const game = structuredClone(this.currentGame.value);
    if (!game) return;

    // sort players by points
    const players = game.players.filter(Boolean).sort((a, b) => b.points - a.points);
  
    if (players.length > 1) {
      // assign placements and check for ties
      let currentPlace = 1;
      for (let i = 0; i < players.length; i++) {
        if (i > 0 && players[i].points === players[i - 1].points) {
          players[i].place = players[i - 1].place;
        } else {
          players[i].place = currentPlace;
        };
        currentPlace++;
      };
    } else {
      // TODO: if only one player, check if they beat the number of rounds goal
      players[0].place = 1;
    };
  
    game.players = players;
    game.status = 'finished';

    await this.saveGame(game);
    await this.usersService.updateStats(players, game.hostId);
  }

  async saveGame(game) {
    // add the item to localStorage, set currentGame to the new/updated game, and add to firestore
    localStorage.setItem('game', JSON.stringify(game));
    this.currentGame.next(game);

    const gameRef = doc(this.db, 'games', game.id);
    await setDoc(gameRef, { ...game, lastUpdated: new Date() }, { merge: true });
  }
}
