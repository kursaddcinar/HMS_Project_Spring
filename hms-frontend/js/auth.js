import { ApiService } from './api.js';

export class AuthService {

    static async login(username, password) {
        try {
            // Backend sözleşmesi: /auth/login -> { username, password }
            const response = await ApiService.request('/auth/login', 'POST', {
                username,
                password
            });

            if (response.token) {
                localStorage.setItem('hms_token', response.token);
                localStorage.setItem('hms_username', username); // Basit display için
                return true;
            }
            return false;
        } catch (error) {
            throw error;
        }
    }

    static logout() {
        localStorage.removeItem('hms_token');
        localStorage.removeItem('hms_username');
        window.location.reload();
    }

    static isAuthenticated() {
        return !!localStorage.getItem('hms_token');
    }

    static getCurrentUser() {
        // Gerçek uygulamada token decode edilip user bilgisi alınmalı.
        // Şimdilik localStorage'dan alıyoruz.
        return localStorage.getItem('hms_username');
    }
}