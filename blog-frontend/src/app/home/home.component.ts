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

  loadFollowing() {
  this.authService.getUserFollowing(this.currentUsername).subscribe({
    next: (list: any) => {
      this.followingList = list;
    },
    error: (err) => {
      console.error("Backend recursion crash detected", err);
      this.followingList = []; // Reset to empty so isFollowing() doesn't break
    }
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
      this.loadFollowing(); 
      this.loadPosts();
    },
    error: (err: any) => {
      // Even if there is a network error, check the DB again
      console.warn("Network hiccup, but checking DB status anyway...");
      setTimeout(() => {
        this.loadFollowing();
        this.loadPosts();
      }, 500); 
    }
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

  previewUrl: string | null = null; // Variable to store the temp URL

  onFileSelected(event: any) {
  this.selectedFile = event.target.files[0];
  
  if (this.selectedFile) {
    // Create a temporary local URL for the preview
    this.previewUrl = URL.createObjectURL(this.selectedFile);
  }
}

  submitPost() {
  const loggedInUser = this.authService.getCurrentUser();
  if (!loggedInUser) {
    this.router.navigate(['/login']);
    return;
  }

  const formData = new FormData();
  // Ensure these property names match exactly what your 
  // PostController @RequestParam expects!
  formData.append('title', this.ngModel_title);
  formData.append('description', this.ngModel_desc);
  formData.append('username', loggedInUser.username);
  
  if (this.selectedFile) {
    formData.append('file', this.selectedFile);
    console.log("Uploading file:", this.selectedFile.name, "Size:", this.selectedFile.size);
  }

 this.authService.uploadPost(formData).subscribe({
    next: () => {
      alert("Post successful!");
      this.resetForm();
      this.previewUrl = null; // Clear the preview
      this.loadPosts(); 
    },
    error: (err) => {
      console.error("Server Error:", err); // This is what showed the 500 error
      alert("Post failed. Check if the 'uploads' folder exists in your project root.");
      this.resetForm(); // Reset even on error to "un-freeze" the UI
      this.loadPosts(); // Reload to show existing posts again
    }
  });

}

resetForm() {
  this.ngModel_title = '';
  this.ngModel_desc = '';
  this.selectedFile = null;
}

deletePost(postId: number) {
  if (confirm("Are you sure you want to delete this post?")) {
    this.authService.deletePost(postId).subscribe({
      next: () => {
        alert("Post deleted");
        this.loadPosts(); // Refresh the feed
      },
      error: (err) => console.error("Delete failed", err)
    });
  }
}

editingPostId: number | null = null; // Tracks the ID of the post in "Edit Mode"
editTitle: string = '';
editDesc: string = '';

startEdit(post: any) {
  this.editingPostId = post.id;
  this.editTitle = post.title;
  this.editDesc = post.description;
}

cancelEdit() {
  this.editingPostId = null;
}

saveEdit(post: any) {
  const updatedData = { ...post, title: this.editTitle, description: this.editDesc };
  this.authService.updatePost(post.id, updatedData).subscribe({
    next: () => {
      this.editingPostId = null;
      this.loadPosts();
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