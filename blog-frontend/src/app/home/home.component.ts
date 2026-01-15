import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';
import { AuthService } from '../auth.service'; // Ensure this path is correct
import { Post } from '../post.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule], 
  templateUrl: './home.component.html',
  styleUrls: ['../register/register.component.css']
})
export class HomeComponent implements OnInit {
  // 1. These variables MUST match the [(ngModel)] names in your HTML
  ngModel_desc: string = '';
  ngModel_media: string = '';
  posts: Post[] = []; 

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.authService.getPosts().subscribe({
      next: (data) => {
        this.posts = data;
        console.log("Posts loaded:", data);
      },
      error: (err) => console.error("Error loading posts", err)
    });
  }

  submitPost() {
    const loggedInUser = this.authService.getCurrentUser();
    
    if (!loggedInUser) {
      alert("Please login first");
      this.router.navigate(['/login']);
      return;
    }

    // 2. Use the ngModel variables to create the post
    const postToSave: Post = {
      description: this.ngModel_desc,
      mediaUrl: this.ngModel_media,
      user: { username: loggedInUser.username }
    };

    this.authService.createPost(postToSave).subscribe({
      next: (res) => {
        // 3. Reset the form variables
        this.ngModel_desc = '';
        this.ngModel_media = '';
        this.loadPosts(); // Refresh the feed immediately
      },
      error: (err) => alert("Post failed")
    });
  }

  logout() {
    this.router.navigate(['/login']);
  }
}