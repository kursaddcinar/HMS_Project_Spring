export class Utils {
    /**
     * JWT Token'ın payload kısmını decode eder.
     * @param {string} token
     * @returns {object|null}
     */
    static parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Token decode edilemedi", e);
            return null;
        }
    }

    // Rolleri backend enum'larına göre sabitleyelim
    static ROLES = {
        ADMIN: 'ADMIN',
        DOCTOR: 'DOCTOR',
        PATIENT: 'PATIENT'
    };
}