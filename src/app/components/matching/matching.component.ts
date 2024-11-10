import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { CurrentGame } from '../../interfaces/current-game';
import { GameService } from '../../services/game.service';

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
  numCardsRevealed: number = 0;
  revealedCard: any | null;
  loadingGame: boolean = true;

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
        this.initializeForm();
      }
    });
  }

  async initializeForm() {
    // initialize FormArray for cards and players
    const cardFormGroups = await this.initializeCards();
    const playerFormGroups = this.initializePlayers();

    this.form.setControl('cards', new FormArray(cardFormGroups));
    this.form.setControl('players', new FormArray(playerFormGroups));

    // once cards and players are initialized, set loadingGame to false
    this.loadingGame = false;
  }

  async initializeCards() {
    // wait for cards to be initialized
    await this.waitForCards();

    // set up FormArray
    return this.currentGame$.cards.map((card) => {
      const newGroup = this.fb.group({
        id: new FormControl(card.id),
        name: new FormControl(card.name),
        found: new FormControl(card.found),
        playerFound: new FormControl(card.playerFound),
        revealed: new FormControl(card.revealed),
        images: this.fb.group({
          small: new FormControl(card.images.small), 
          large: new FormControl(card.images.large),
          setLogo: new FormControl(card.images.setLogo),
        })
      });

      return newGroup
    })
  }

  async waitForCards() {
    const startTime = Date.now();

    while (!this.currentGame$.cards[0]) {
      if (Date.now() - startTime > 10000) {
        throw new Error('Timeout exceeded');
      }
  
      await new Promise(resolve => setTimeout(resolve, 100));
    }
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
    // if the card clicked hasn't already been found (matched) and there isn't already 2 cards revealed, show the card and set the next card to end the turn
    if (!card.value.found && this.numCardsRevealed < 2) {
      this.numCardsRevealed += 1;
      card.get('revealed').setValue(true);

      // if this is the first card the player has revealed, save card info
      if (this.numCardsRevealed === 1) {
        this.revealedCard = card;

      // if this is the second card revealed, check whether there's a match
      } else {
        if (this.revealedCard.value.id === card.value.id) {
          this.ifMatchFound(card);
        } else {
          this.ifNoMatchFound(card);
        }
      }
    }
  }

  ifMatchFound(card: any) {
    // add point to player who found the match
    // code

    console.log("congrats! you found a match!"); // placeholder

    // wait two seconds then set found to true on both cards and reset turn info
    setTimeout(() => {
      card.get('found').setValue(true);
      this.revealedCard.get('found').setValue(true);
      this.revealedCard = null;
      this.numCardsRevealed = 0;
      this.currentGame$.matchesRemaining -= 1;

      // check if that was the last match, and if so, end the game
      // code
    }, 2000);
  }

  ifNoMatchFound(card: any) {
    console.log('no match found'); // placeholder

    // wait two seconds then hide both cards again, reset turn info, and switch to the next player's turn/next round
    setTimeout(() => {
      card.get('revealed').setValue(false);
      this.revealedCard.get('revealed').setValue(false);
      this.revealedCard = null;
      this.numCardsRevealed = 0;
      let players = this.form.controls['players'].value;

      // if one player, switch to next round
      if (players.length === 1) {
        this.currentGame$.round += 1;

      // if multiple players and it's the last player's turn, switch to next round and set turn to first player
      } else if (this.currentGame$.turn === players[players.length - 1]) {
        this.currentGame$.round += 1;
        this.currentGame$.turn = players[0];

      // if multiple players and not last player's turn, switch to next player's turn
      } else {
        for (let i = 0; i < players.length; i++) {
          if (this.currentGame$.turn.uid === players[i].uid) {
            this.currentGame$.turn = players[i + 1];
            return;
          }
        }
      }
    }, 2000);
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
