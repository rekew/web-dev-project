import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registration-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registration-page.component.html',
  styleUrls: ['./registration-page.component.css'],
})
export class RegistrationPageComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  submitted: boolean = false;

  onSubmit(form: any) {
    this.submitted = true;

    if (form.valid && this.password === this.confirmPassword) {
      console.log('✅ Form Submitted', {
        name: this.name,
        email: this.email,
        password: this.password,
      });
    }
  }
}
