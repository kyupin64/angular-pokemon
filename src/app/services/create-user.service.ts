import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class CreateUserService {

  constructor(
    private auth: Auth, 
    private db: Firestore
  ) { }

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
