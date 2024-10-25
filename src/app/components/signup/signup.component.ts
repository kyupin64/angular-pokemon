import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
  signupValid: boolean = true;

  constructor(fb: FormBuilder, private createUserService: CreateUserService) {
    this.form = fb.group({
      email: [''],
      username: [''],
      password: ['']
    })
  }

  onSubmit() {
    this.createUserService.newUser(this.form.controls['email'].value, this.form.controls['username'].value, this.form.controls['password'].value);
  }
}
