import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  imports: [HttpClientModule, FormsModule, RouterModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
  standalone: true,
})
export class ChatComponent implements OnInit {
  searchChat: string = '';
  isSidebarOpen = false;
  userData: any = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('access_token');
      if (!token) {
        this.router.navigate(['/login']);
      } else {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });

        this.http
          .get('http://localhost:8000/api/users/me/', {
            headers,
            observe: 'response',
          })
          .subscribe({
            next: (res) => {
              console.log('Response headers:', res.headers);
              console.log('Body:', res.body);
              const userData: any = res.body;
              if (userData) {
                localStorage.setItem('user_data', JSON.stringify(userData));
              }
            },
            error: (err) => {
              console.error('Ошибка при получении данных пользователя', err);
            },
          });
      }
    }
  }

  filteredGroups() {}

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
