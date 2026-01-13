import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router'; // <--- 1. Add this import
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html', // <--- CHECK THIS PATH
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  user = { username: '', password: '', email: '' };

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.authService.register(this.user).subscribe({
      next: (response) => alert(response),
      error: (err) => console.error('Registration failed', err)
    });
  }
}