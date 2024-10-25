import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormField, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatCardModule,
    MatFormField,
    MatError,
    MatInput,
    MatButtonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  form: FormGroup;
  fb: FormBuilder = new FormBuilder;
  loginValid: boolean = true;

  constructor(
    fb: FormBuilder, 
    private loginService: LoginService,
    private router: Router
  ) {
    this.form = fb.group({
      email: [''],
      password: ['']
    })
  }

  ngOnInit() {
    this.form.valueChanges.subscribe(value => {
      this.loginValid = true;
    });
  }

  async onSubmit() {
    const result = await this.loginService.login(this.form.controls['email'].value, this.form.controls['password'].value);

    if (result.email === this.form.controls['email'].value) {
      this.router.navigate(['./setup']);
    } else {
      this.loginValid = false;
    }
  }
}
