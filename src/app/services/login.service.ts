import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { collection, Firestore, getDocs, limit, query, where } from '@angular/fire/firestore'
import { User } from '../interfaces/user';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  // loggedIn: boolean = false;
  // currentUser: User;
  private loggedIn = new BehaviorSubject<boolean>(false);
  private currentUser = new BehaviorSubject<User | null>(null);

  constructor(
    private auth: Auth,
    private db: Firestore
  ) {
    // check localStorage on initialization
    const userData = localStorage.getItem('user');
    if (userData) {
      const user: User = JSON.parse(userData);
      this.currentUser.next(user);
      this.loggedIn.next(true);
    }
  }

  getLoggedInBool() {
    return this.loggedIn.asObservable();
  }

  logout() {
    this.currentUser.next(null);
    this.loggedIn.next(false);
    localStorage.removeItem('user');
    localStorage.removeItem('game');
  }

  getCurrentUser() {
    return this.currentUser.asObservable();
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
        this.currentUser.next(foundUser);
        this.loggedIn.next(true);
        localStorage.setItem('user', JSON.stringify(foundUser));
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
