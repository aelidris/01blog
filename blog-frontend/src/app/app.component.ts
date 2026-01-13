import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // <--- Import this

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // <--- Add to imports array
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'blog-frontend';
}