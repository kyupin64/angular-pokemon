import { Injectable } from '@angular/core';
import { collection, Firestore, getDocs, limit, query, where } from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
import { User } from '../interfaces/user';

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
    }
  }

  async getUserWithUsername(username: string): Promise<User> {
    try {
      // find user in firestore users collection
      const usersCollection =  collection(this.db, 'users');
      const q = query(usersCollection, where('username', '==', username))
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
    }
  }
}
