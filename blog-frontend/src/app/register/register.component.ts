import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; // 1. Add Router here
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  user = { username: '', email: '', password: '' };

  // 2. Add 'private router: Router' to the constructor
  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.register(this.user).subscribe({
      next: (response) => {
        alert(response); // "User registered successfully!"
        this.router.navigate(['/login']); // 3. This line moves the user!
      },
      error: (err) => {
        alert("Registration failed");
        console.error(err);
      }
    });
  }
}