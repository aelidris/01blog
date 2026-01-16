import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';
import { AuthService } from '../auth.service'; 
import { Post } from '../post.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule], 
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  ngModel_title: string = '';
  ngModel_desc: string = '';
  selectedFile: File | null = null; // New variable to store the file
  posts: any[] = []; 

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.authService.getPosts().subscribe({
      next: (data) => {
        this.posts = data;
      },
      error: (err) => console.error("Error loading posts", err)
    });
  }

  // Inside your HomeComponent class
isVideo(url: string): boolean {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
}

  // Captures the file when the user selects it from their computer

onFileSelected(event: any) {
    this.selectedFile = event.target.files[0]; // Stores the binary file from your computer
}

submitPost() {
    const loggedInUser = this.authService.getCurrentUser();
    
    // Only block if the user isn't logged in
    if (!loggedInUser) {
        alert("Please log in first.");
        this.router.navigate(['/login']);
        return;
    }

    const formData = new FormData();
    formData.append('title', this.ngModel_title);
    formData.append('description', this.ngModel_desc);
    formData.append('username', loggedInUser.username);
    
    // Only append the file if the user actually chose one
    if (this.selectedFile) {
        formData.append('file', this.selectedFile);
    }

    this.authService.uploadPost(formData).subscribe({
        next: () => {
            this.ngModel_title = '';
            this.ngModel_desc = '';
            this.selectedFile = null;
            this.loadPosts();
        },
        error: (err) => alert("Upload failed. Make sure the backend allows missing files.")
    });
}

  logout() {
    this.router.navigate(['/login']);
  }
}