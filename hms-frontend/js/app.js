import { AuthService } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    const authSection = document.getElementById('auth-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const userDisplay = document.getElementById('user-display');
    const loginError = document.getElementById('login-error');

    // Durum Kontrolü
    if (AuthService.isAuthenticated()) {
        authSection.classList.add('d-none');
        dashboardSection.classList.remove('d-none');
        userDisplay.textContent = AuthService.getCurrentUser();
    } else {
        authSection.classList.remove('d-none');
        dashboardSection.classList.add('d-none');
    }

    // Login Event
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            loginError.classList.add('d-none');

            try {
                await AuthService.login(username, password);
                // Başarılı ise reload yerine UI update yapabiliriz ama
                // şimdilik temiz başlangıç için reload:
                window.location.reload();
            } catch (error) {
                loginError.textContent = "Giriş başarısız. Bilgilerinizi kontrol edin.";
                loginError.classList.remove('d-none');
            }
        });
    }

    // Logout Event
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            AuthService.logout();
        });
    }
}