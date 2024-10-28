import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CardsService {

  constructor() { }

  getAllCardSets(): Observable<any[]> {
    try {
      return from(
        fetch("https://api.pokemontcg.io/v2/sets")
          .then(response => response.json())
            .then(sets => sets.data)
      )
    } catch (error) {
      const errorCode = error.code;
      return error.message;
    }
  }
}
