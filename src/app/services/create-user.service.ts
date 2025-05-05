import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { collection, doc, Firestore, getDocs, query, setDoc, where } from '@angular/fire/firestore';
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
      const userRef = doc(this.db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: email,
        username: username,
        stats: {
          played: 0,
          won: 0,
          lost: 0,
          matches: 0,
          beat: [],
          lostTo: []
        },
        createdAt: new Date(),
        lastUpdated: null
      });

      return 'successfully added new user';
    } catch (error) {
      const errorCode = error.code;
      return error.message;
    };
  }
}
