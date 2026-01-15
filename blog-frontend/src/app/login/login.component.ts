import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; // 1. ADD 'Router' HERE
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink], 
  templateUrl: './login.component.html',
  styleUrl: '../register/register.component.css'
})
export class LoginComponent {
  user = { username: '', password: '' };

  // 2. ADD 'private router: Router' TO THE CONSTRUCTOR
  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login(this.user).subscribe({
      next: (response) => {
        // 3. CHECK THE RESPONSE AND NAVIGATE
        if (response === "Login successful!") {
          this.router.navigate(['/home']); 
        } else {
          alert(response);
        }
      },
      error: (err) => alert("Login failed")
    });
  }
}