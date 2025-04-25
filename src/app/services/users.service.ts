import { Injectable } from '@angular/core';
import { collection, Firestore, getDocs, limit, query, where } from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';

import { User } from '../interfaces/user';
import { Player } from '../interfaces/player';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private db: Firestore) { }

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
        foundUser = doc.data();
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
}
