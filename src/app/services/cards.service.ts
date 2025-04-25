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
      );
    } catch (error) {
      const errorCode = error.code;
      return error.message;
    };
  }
  
  async getRandomCards(cardSet: string, matchesNum: number) {
    const cards = await this.getAllCardsInSet(cardSet);

    // check if there are enough unique cards to match the number of matches
    if (matchesNum > cards.length) {
      throw new Error('Not enough unique cards to create the requested number of matches.');
    };

    let randomCardSet = new Set<CurrentGameCard>(); // use Set to avoid duplicates
    while (randomCardSet.size < matchesNum) {
      // get random numbers between 1 and the length of cards in set (amount equal to selected number of matches)
      const rng = Math.floor(Math.random() * cards.length);
      randomCardSet.add(cards[rng]);
    };

    // add each random card to randomCards array
    const randomCards = [];
    randomCardSet.forEach(card => {
      if (randomCards.length < matchesNum * 2) {
        randomCards.push(card);
        randomCards.push({ ...card }); // add duplicate so there are 2 of each card
      } else {
        return;
      };
    });

    // shuffle cards so they're in a unique order
    return this.shuffleCards(randomCards);
  }

  async getAllCardsInSet(setId: string): Promise<CurrentGameCard[]> {
    const query = `set.id:${setId}`;
    const url = `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
  
      return data.data.map((card: any) => ({
        id: card.id,
        name: card.name,
        found: false,
        playerFoundId: null,
        revealed: false,
        images: {
          small: card.images.small,
          large: card.images.large,
          setLogo: card.set.images.logo
        }
      })) as CurrentGameCard[];

    } catch (error) {
      console.error("Error fetching cards:", error);
      return [];
    };
  }

  shuffleCards(cards: Array<CurrentGameCard>) {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    };

    return cards;
  }
}
