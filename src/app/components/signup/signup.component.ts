import { Component } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { map, Observable, of } from 'rxjs';
import { NgIf } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatFormField, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { CreateUserService } from '../../services/create-user.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    MatCardModule,
    MatFormField,
    MatError,
    MatInput,
    MatButtonModule,
  ],
  providers: [],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  form: FormGroup;
  fb: FormBuilder = new FormBuilder;

  constructor(fb: FormBuilder, private createUserService: CreateUserService) {
    this.form = fb.group({
      email: new FormControl('', [ Validators.required, Validators.email ], [ this.uniqueEmailValidator ]),
      username: new FormControl('', [ Validators.required ], [ this.uniqueUsernameValidator ]),
      password: new FormControl('', [ Validators.required, Validators.minLength(6) ])
    })
  }

  uniqueEmailValidator: AsyncValidatorFn = (control: AbstractControl): Observable<ValidationErrors | null> => {
    // if no value, return null
    if (!control.value) {
      return of(null); 
    }
  
    // call ifUnique and return error message if unique is false, return null if unique is true
    return this.createUserService.ifUnique('email', control.value).pipe(
      map(unique => (unique ? null : { emailTaken: { value: control.value } }))
    );
  };

  uniqueUsernameValidator: AsyncValidatorFn = (control: AbstractControl): Observable<ValidationErrors | null> => {
    // if no value, return null
    if (!control.value) {
      return of(null); 
    }
  
    // call ifUnique and return error message if unique is false, return null if unique is true
    return this.createUserService.ifUnique('username', control.value).pipe(
      map(unique => (unique ? null : { usernameTaken: { value: control.value } }))
    );
  };

  onSubmit() {
    // if form is valid, create new user
    if (this.form.valid) {
      this.createUserService.newUser(
        this.form.value.email,
        this.form.value.username,
        this.form.value.password
      );
    } else {
      console.log('Form is invalid');
    }
  }
}
