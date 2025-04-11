import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface User {
  id: number;
  username: string;
  email: string;
  bio: string;
  avatar: string | null;
  is_online: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) {}

  user: User = {
    id: 0,
    username: '',
    email: '',
    bio: '',
    avatar: null,
    is_online: false,
  };

  selectedAvatarFile: File | null = null;
  avatarPreview: string | null = null;

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
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get<User>('http://127.0.0.1:8000/api/users/me/', { headers })
      .subscribe({
        next: (data) => {
          if (data) {
            this.user = data;
            // Ensure the avatar URL is correctly processed
            if (this.user.avatar && !this.user.avatar.startsWith('http')) {
              this.user.avatar = 'http://127.0.0.1:8000' + this.user.avatar;
              console.log('the avatar is : ' + this.user.avatar);
            }
            console.log('User profile loaded with avatar:', data);
          }
        },
        error: (err) => {
          console.error('Error loading user profile:', err);
          this.errorMessage = 'Failed to load user profile';
        },
      });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedAvatarFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  updateProfile(): void {
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.errorMessage = 'Missing access token';
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const formData = new FormData();
    formData.append('username', this.user.username);
    formData.append('email', this.user.email);
    formData.append('bio', this.user.bio);
    formData.append('is_online', String(this.user.is_online));

    // If there's a selected avatar, append it to formData
    if (this.selectedAvatarFile) {
      formData.append('avatar', this.selectedAvatarFile);
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('Sending data to the backend:', formData);

    this.http
      .put<User>(`http://127.0.0.1:8000/api/users/${this.user.id}/`, formData, {
        headers,
      })
      .subscribe({
        next: (updatedUser) => {
          // Log the response from the backend to inspect the updated user data
          console.log('Backend response:', updatedUser);

          this.successMessage = 'Profile updated successfully';
          this.user = updatedUser; // The updated user will have the correct avatar URL
          this.selectedAvatarFile = null;
          this.avatarPreview = null;
          this.isLoading = false;
          this.loadUserProfile(); // Load the user profile to get the updated avatar
        },
        error: (err) => {
          this.errorMessage = 'Failed to update profile';
          console.error('Error updating profile:', err);
          this.isLoading = false;
        },
      });
  }

  deleteAccount(): void {
    if (
      !confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      this.errorMessage = 'Missing access token';
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.isLoading = true;
    this.errorMessage = '';

    this.http
      .delete(`http://127.0.0.1:8000/api/users/${this.user.id}/`, { headers })
      .subscribe({
        next: () => {
          this.successMessage = 'Account deleted successfully';
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          this.isLoading = false;
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.errorMessage = 'Failed to delete account';
          console.error('Error deleting account:', err);
          this.isLoading = false;
        },
      });
  }

  logOut(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }
}
