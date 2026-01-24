import { Component, OnInit } from '@angular/core'; // Added OnInit here
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
  currentUsername: string = ''; 
  ngModel_title: string = '';
  ngModel_desc: string = '';
  selectedFile: File | null = null;
  posts: any[] = []; 
  
  // New variables for subscription logic
  showFollowedOnly: boolean = false; // Controls which feed to show
  followingList: any[] = []; // Stores the list of users you follow

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
  const user = this.authService.getCurrentUser();
  if (user && user.username) {
    this.currentUsername = user.username;
    // We must ensure the username is set BEFORE we fetch data
    this.loadFollowing(); 
    this.loadPosts();
  } else {
    this.router.navigate(['/login']);
  }
}

  // Toggles between "Global" and "Followed Only"
  toggleFeed(followedOnly: boolean) {
    this.showFollowedOnly = followedOnly;
    this.loadPosts();
  }

  loadPosts() {
    if (!this.currentUsername) return;
    if (this.showFollowedOnly) {
      // Show only posts from people you follow
      this.authService.getFollowedPosts(this.currentUsername).subscribe({
        next: (data:any) => this.posts = data,
        error: (err:any) => console.error("Error loading followed feed", err)
      });
    } else {
      // Show all posts (Discover mode)
      this.authService.getPosts().subscribe({
        next: (data) => this.posts = data,
        error: (err) => console.error("Error loading all posts", err)
      });
    }
  }

  // Fetches the list of usernames the current user follows
  loadFollowing() {
    this.authService.getUserFollowing(this.currentUsername).subscribe({
      next: (list:any) => this.followingList = list,
      error: (err) => console.error("Could not load following list", err)
    });
  }

  // Checks if a specific username is in your following list
  isFollowing(username: string): boolean {
  if (!this.followingList || this.followingList.length === 0) return false;
  
  // Use console.log to see what exactly is inside your followingList
  // console.log("Checking if following:", username, "Current list:", this.followingList);

  return this.followingList.some((user: any) => {
    // Check if the item in the list is a string or an object with a username
    const followName = typeof user === 'string' ? user : user.username;
    return followName === username;
  });
}

  followUser(targetUsername: string) {
  this.authService.followUser(targetUsername, this.currentUsername).subscribe({
    next: () => {
      console.log("Followed " + targetUsername);
      this.loadFollowing(); // IMPORTANT: This refreshes your local list
    },
    error: (err: any) => alert("Could not follow user")
  });
}

unfollowUser(targetUsername: string) {
  this.authService.unfollowUser(targetUsername, this.currentUsername).subscribe({
    next: () => {
      console.log("Unfollowed " + targetUsername);
      this.loadFollowing(); // IMPORTANT: This clears them from your local list
    },
    error: (err: any) => alert("Could not unfollow user")
  });
}

  isVideo(url: string): boolean {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  submitPost() {
    const loggedInUser = this.authService.getCurrentUser();
    if (!loggedInUser) {
      this.router.navigate(['/login']);
      return;
    }

    const formData = new FormData();
    formData.append('title', this.ngModel_title);
    formData.append('description', this.ngModel_desc);
    formData.append('username', loggedInUser.username);
    
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.authService.uploadPost(formData).subscribe({
    next: () => {
      alert("Post successful!");
      this.selectedFile = null; // Clear the file
      this.loadPosts();
    },
    error: (err) => {
      alert("Post failed: File might be too large");
      this.selectedFile = null; // Reset so the next post isn't blocked
      console.error(err);
    }
  });
  }

  logout() {
  this.authService.logout(); // The red line should disappear now!
  this.currentUsername = '';
  this.posts = [];
  this.followingList = [];
  this.router.navigate(['/login']);
}
}