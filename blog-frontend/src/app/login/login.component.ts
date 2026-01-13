import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router'; // <--- 1. Add this import
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink], 
  templateUrl: './login.component.html', // <--- This must point to a real file
  styleUrl: '../register/register.component.css' // <--- Note the ../ to reach the other folder
})
export class LoginComponent {
  user = { username: '', password: '' };

  constructor(private authService: AuthService) {}

  onLogin() {
    this.authService.login(this.user).subscribe({
      next: (response) => alert(response),
      error: (err) => alert("Login failed")
    });
  }
}