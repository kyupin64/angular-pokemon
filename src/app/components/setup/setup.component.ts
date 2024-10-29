import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

import { User } from '../../interfaces/user';
import { UsersService } from '../../services/users.service';
import { LoginService } from '../../services/login.service';
import { CardsService } from '../../services/cards.service';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './setup.component.html',
  styleUrl: './setup.component.css'
})
export class SetupComponent {
  form: FormGroup;
  fb: FormBuilder = new FormBuilder;
  allUsers$: Observable<User[]>;
  allCardSets$: Observable<{ series: string, sets: any[] }[]>;
  currentUser: User;

  constructor(
    fb: FormBuilder,
    private usersService: UsersService,
    private loginService: LoginService,
    private cardsService: CardsService,
    private gameService: GameService,
    private router: Router
  ) {
    this.currentUser = this.loginService.getCurrentUser();

    this.form = fb.group({
      playersNum: new FormControl(1, [ Validators.required ]),
      matchesNum: new FormControl('', [ Validators.required ]),
      cardSet: new FormControl('', [ Validators.required ]),
      players: new FormArray([new FormControl(this.currentUser.username)])
    })
  }

  ngOnInit() {
    this.allUsers$ = this.usersService.getAllUsers();

    // fetch and process card sets
    this.allCardSets$ = this.cardsService.getAllCardSets().pipe(
      map(sets => {
        // group sets by series
        const seriesMap = new Map<string, any[]>();
        sets.forEach(set => {
          const seriesName = set.series;
          if (!seriesMap.has(seriesName)) {
            seriesMap.set(seriesName, []);
          }
          seriesMap.get(seriesName)!.push(set);
        });
        // convert map to array
        return Array.from(seriesMap.entries()).map(([series, sets]) => ({ series, sets }));
      })
    );

    // update number of players when user changes selected number of players
    this.form.get('playersNum')?.valueChanges.subscribe(value => {
      this.updatePlayers(value);
    });
  }

  // add or remove players from players FormArray to match user selected number of players
  updatePlayers(num: number): void {
    const playersArray = this.players;
    while (playersArray.length !== num) {
      if (playersArray.length < num) {
        playersArray.push(this.createPlayerControl());
      } else {
        playersArray.removeAt(playersArray.length - 1);
      }
    }
  }

  // create new FormControl when adding players
  createPlayerControl(): FormControl {
    return new FormControl('', [Validators.required]);
  }

  // players FormArray getter
  get players(): FormArray {
    return this.form.get('players') as FormArray;
  }

  async onSubmit() {
    if (this.form.valid) {
      const result = await this.gameService.createNewGame(
        this.form.controls['matchesNum'].value, 
        this.form.controls['cardSet'].value, 
        this.form.controls['players'].value
      );

      if (result === true) {
        this.router.navigate(['./matching']);
      }
    } else {
      console.log('Form is invalid');
    }
  }
}
