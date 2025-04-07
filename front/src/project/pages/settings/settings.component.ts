import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) {}

  user = {
    id: 0,
    username: '',
    email: '',
    bio: '',
    avatar: null,
    is_online: false,
  };

  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('access_token');
      if (!token) {
        this.router.navigate(['/login']);
      } else {
        this.loadUserProfile();
      }
    }
  }

  loadUserProfile(): void {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        this.user = {
          ...this.user,
          ...parsedUser,
        };
      } catch (e) {
        console.error('Failed to parse user data from localStorage', e);
        this.errorMessage = 'Ошибка загрузки профиля пользователя.';
      }
    } else {
      this.errorMessage = 'Нет данных пользователя в localStorage.';
    }
  }

  updateProfile(): void {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');

    if (!userData || !token) {
      console.error('Missing user data or token.');
      return;
    }

    const parsedUser = JSON.parse(userData);
    const userId = parsedUser.id;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    const updatePayload = {
      username: this.user.username,
      email: this.user.email,
      bio: this.user.bio,
      is_online: this.user.is_online,
    };

    this.isLoading = true;

    this.http
      .put(`http://127.0.0.1:8000/api/users/${userId}/`, updatePayload, {
        headers,
      })
      .subscribe({
        next: (res: any) => {
          this.successMessage = 'Profile updated successfully.';

          localStorage.setItem('user_data', JSON.stringify(res));
          this.user = { ...res };

          this.isLoading = false;

          window.location.reload();
        },
        error: (err) => {
          this.errorMessage = 'Failed to update profile.';
          console.error(err);
          this.isLoading = false;
        },
      });
  }

  logOut(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.reload();
  }

  onFileSelected(event: Event): void {}

  deleteAccount(): void {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');

    if (!token || !userData) {
      console.error('Missing token or user data');
      return;
    }

    const parsedUser = JSON.parse(userData);
    const userId = parsedUser.id;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    this.isLoading = true;

    this.http
      .delete(`http://127.0.0.1:8000/api/users/${userId}/`, { headers })
      .subscribe({
        next: () => {
          this.successMessage = 'User deleted successfully.';
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_data');

          this.isLoading = false;
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.errorMessage = 'Failed to delete user.';
          console.error(err);
          this.isLoading = false;
        },
      });
  }
}
