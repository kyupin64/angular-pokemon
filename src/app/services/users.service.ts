import { Injectable } from '@angular/core';
import { collection, doc, Firestore, getDocs, limit, query, setDoc, where } from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';

import { User } from '../interfaces/user';
import { Player } from '../interfaces/player';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private db: Firestore, private loginService: LoginService) { }

  getAllUsers(): Observable<User[]> {
    try {
      const usersCollection = collection(this.db, 'users');

      // query usersCollection to find all users
      const q = query(usersCollection);
      return from(getDocs(q)).pipe(
        map(snapshot => snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User))) // Map to User type
      );
    } catch (error) {
      const errorCode = error.code;
      return error.message;
    };
  }

  async getPlayers(usernames: Array<string>) {
    const players: Array<Player | null> = [];
    try {
      // convert usernames to Player objects and add to players array
      const userPromises = usernames.map(async (username, index) => {
        if (username) {
          const currentPlayer = await this.getUserWithUsername(username);
          players[index] = {
            uid: currentPlayer.uid,
            username: currentPlayer.username,
            points: 0,
            place: 0
          } as Player;
  
        } else {
          players[index] = null;
        };
      });
  
      await Promise.all(userPromises);
  
      return players;
    } catch (err) {
      return err.message;
    };
  }

  async getUserWithUsername(username: string): Promise<User> {
    try {
      // find user in firestore users collection
      const usersCollection =  collection(this.db, 'users');
      const q = query(usersCollection, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      let foundUser;
      querySnapshot.forEach((doc,) => {
        foundUser = { ...doc.data(), uid: doc.id };
      }, limit(1));

      // return user if it exists
      if (foundUser) {
        return foundUser;
      } else {
        return null;
      }
    } catch (error) {
      const errorCode = error.code;
      return error.message;
    };
  }

  async updateStats(players: Array<Player>, hostId) {
    // loop through each player to update their stats in firestore
    const updatePromises = players.map(async (player) => {
      const user: User = await this.getUserWithUsername(player.username);
      const stats = user.stats;

      const beatPlayers = players.filter(p => p.place > player.place && !stats.beat.includes(p.username)).map(p => p.username);
      const lostToPlayers = players.filter(p => p.place < player.place && !stats.lostTo.includes(p.username)).map(p => p.username);

      const updatedStats = {
        played: stats.played + 1,
        won: player.place === 1 ? stats.won + 1 : stats.won,
        lost: player.place !== 1 ? stats.lost + 1 : stats.lost,
        matches: stats.matches + player.points,
        beat: stats.beat.concat(beatPlayers),
        lostTo: stats.lostTo.concat(lostToPlayers)
      };
    
      const userRef = doc(this.db, 'users', player.uid);
      await setDoc(userRef, { ...user, stats: updatedStats, lastUpdated: new Date() }, { merge: true });

      // update currently logged in user observable
      if (player.uid === hostId) {
        this.loginService.updateCurrentUser({ ...user, stats: updatedStats, currentGame: null, lastUpdated: new Date() });
      };
    });
    
    // wait for all players' stats to update
    await Promise.all(updatePromises);
  }
}
