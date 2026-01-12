import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogService } from './services/blog.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="text-align:center; margin-top: 50px; font-family: sans-serif;">
      <h1>Welcome to 01Blog 🚀</h1>
      <div style="padding: 20px; border: 1px solid #ccc; display: inline-block;">
        <p>Backend Connection Status:</p>
        <h2 [style.color]="isConnected ? 'green' : 'red'">
          {{ backendMessage }}
        </h2>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  backendMessage = 'Trying to connect...';
  isConnected = false;

  constructor(private blogService: BlogService) {}

  ngOnInit() {
    this.blogService.getTestMessage().subscribe({
      next: (response) => {
        this.backendMessage = response.message;
        this.isConnected = true;
      },
      error: (err) => {
        this.backendMessage = 'Backend is OFFLINE ❌';
        this.isConnected = false;
        console.error(err);
      }
    });
  }
}