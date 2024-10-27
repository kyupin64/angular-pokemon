import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { addDoc, collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { User } from '../interfaces/user';
import { from, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreateUserService {

  constructor(
    private auth: Auth, 
    private db: Firestore
  ) { }

  ifUnique(key: string, value: string): Observable<boolean> {
    const usersCollection =  collection(this.db, 'users');

    // query usersCollection to find existing username/email
    const q = query(usersCollection, where(key, '==', value));
    return from(getDocs(q)).pipe(
      map(querySnapshot => querySnapshot.empty) // if no existing username/email is found, return true (unique)
    );
  }

  async newUser(email: string, username: string, password: string) {
    try {
      // create firebase auth user
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // create new user in firestore users collection
      const newUser: User = {
        uid: user.uid,
        email: email,
        username: username
      }
      const usersCollection = collection(this.db, 'users');
      await addDoc(usersCollection, newUser);
      return 'successfully added new user';
    } catch (error) {
      const errorCode = error.code;
      return error.message;
    }
  }
}
