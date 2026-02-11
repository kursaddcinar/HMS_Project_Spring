// API Yapılandırması ve HTTP İstekleyicisi

const BASE_URL = 'http://localhost:8080/api/v1';

export class ApiService {

    static getToken() {
        return localStorage.getItem('hms_token');
    }

    static async request(endpoint, method = 'GET', body = null) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            method,
            headers,
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        // Loading göster
        document.getElementById('loading')?.classList.remove('d-none');

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, config);

            // Loading gizle
            document.getElementById('loading')?.classList.add('d-none');

            // 401 Unauthorized yakalama
            if (response.status === 401) {
                localStorage.removeItem('hms_token');
                window.location.reload(); // Giriş ekranına atar
                throw new Error('Oturum süresi doldu.');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Hata: ${response.status}`);
            }

            // Bazı endpointler boş dönebilir (204 No Content gibi)
            const text = await response.text();
            return text ? JSON.parse(text) : {};

        } catch (error) {
            document.getElementById('loading')?.classList.add('d-none');
            console.error("API Hatası:", error);
            throw error;
        }
    }
}