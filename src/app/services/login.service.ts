import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { collection, Firestore, getDocs, limit, query, where } from '@angular/fire/firestore'
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  loggedIn: boolean = false;
  currentUser: User;

  constructor(
    private auth: Auth,
    private db: Firestore
  ) { }

  getLoggedInBool() {
    return this.loggedIn;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  async login(email: string, password: string) {
    try {
      // sign in to firebase auth using email and password
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // find user in firestore users collection
      const usersCollection =  collection(this.db, 'users');
      const q = query(usersCollection, where('uid', '==', user.uid))
      const querySnapshot = await getDocs(q);

      let foundUser;
      querySnapshot.forEach((doc,) => {
        foundUser = doc.data();
      }, limit(1));

      // if user exists, set currentUser to foundUser and set loggedIn to true
      if (foundUser) {
        this.currentUser = foundUser;
        this.loggedIn = true;
        return foundUser;
      } else {
        return 'no user found'
      }
    } catch (error) {
      const errorCode = error.code;
      return error.message;
    }
  }
}
