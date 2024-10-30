import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { CurrentGame } from '../../interfaces/current-game';
import { GameService } from '../../services/game.service';
import { CurrentGameCard } from '../../interfaces/current-game-card';

@Component({
  selector: 'app-matching',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule
  ],
  templateUrl: './matching.component.html',
  styleUrl: './matching.component.css'
})
export class MatchingComponent {
  form: FormGroup;
  fb: FormBuilder = new FormBuilder;
  currentGame$: CurrentGame | null = null;
  cardsArr: Array<CurrentGameCard> = [];

  constructor(
    fb: FormBuilder,
    private gameService: GameService
  ) {
    this.form = this.fb.group({
      cards: new FormArray([]),
      players: new FormArray([])
    })
  }

  ngOnInit() {
    this.gameService.getCurrentGame().subscribe((currentGame) => {
      if (currentGame) {
        this.currentGame$ = currentGame;
        this.cardsArr = currentGame.cards;
        console.log('Current Game:', this.currentGame$);

        const cardFormGroups = this.initializeCards();
        const playerFormGroups = this.initializePlayers();

        this.form.setControl('cards', new FormArray(cardFormGroups));
        this.form.setControl('players', new FormArray(playerFormGroups));

        console.log(this.form.value); // empty cards array and full players array
      }
    });
  }

  initializeCards() {
    console.log('cardsArr: ', this.cardsArr) // logs array with cards in it (not empty)
    console.log('Is cards an array?', Array.isArray(this.cardsArr)); // logs true

    // shuffle cards
    for (let i = this.cardsArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cardsArr[i], this.cardsArr[j]] = [this.cardsArr[j], this.cardsArr[i]];
    }

    // set up FormArray
    const cardFormGroups = this.cardsArr.map(card => {
      console.log('card: ', card) // logs nothing
      const newGroup = this.fb.group({
        id: new FormControl(card.id),
        name: new FormControl(card.name),
        found: new FormControl(card.found),
        playerFound: new FormControl(card.playerFound),
        revealed: new FormControl(card.revealed),
        images: this.fb.group({
          small: new FormControl(card.images.small), 
          large: new FormControl(card.images.large)
        })
      });

      console.log(newGroup) // logs nothing
      return newGroup
    });

    console.log('Card Form Groups:', cardFormGroups); // logs empty array
    return cardFormGroups;
  }

  initializePlayers() {
    // create array to store players
    let playersArr = [];
    for (let i = 1; i < 5; i++) {
      const player = this.currentGame$[`player${i}`];
      if (player) {
        playersArr.push(player)
      }
    }

    // set up FormArray
    return playersArr.map(player => this.fb.group({
      uid: new FormControl(player.uid),
      username: new FormControl(player.username),
      email: new FormControl(player.email)
    }));
  }

  isPlayerTurn(playerId: string): boolean {
    return this.currentGame$.turn?.uid === playerId;
  }

  revealCard(card: any): void {
    card.get('revealed').setValue(true);
  }

  // cards FormArray getter
  get cards(): FormArray {
    return this.form.get('cards') as FormArray;
  }

  // players FormArray getter
  get players(): FormArray {
    return this.form.get('players') as FormArray;
  }
}
