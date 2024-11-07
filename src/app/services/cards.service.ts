import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { CurrentGameCard } from '../interfaces/current-game-card';

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

  getAllCardsInSet(setId: string): Observable<CurrentGameCard[]> {
    const query = `set.id:${setId}`;
    const url = `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}`;

    try {
      return from(
        fetch(url)
          .then(response => response.json())
            .then(cards => {
              // map to CurrentGameCard structure
              return cards.data.map((card: any) => ({
                id: card.id,
                name: card.name,
                found: false,
                playerFound: null,
                revealed: false,
                images: {
                  small: card.images.small,
                  large: card.images.large,
                  setLogo: card.set.images.logo
                }
              })) as CurrentGameCard[];
            })
      )
    } catch (error) {
      const errorCode = error.code;
      return error.message;
    }
  }

  shuffleCards(cards: Array<CurrentGameCard>) {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    return cards;
  }
}
