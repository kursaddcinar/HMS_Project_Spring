import { AuthService } from './auth.js';
import { Utils } from './utils.js';

export class Dashboard {

    constructor() {
        this.sidebar = document.getElementById('sidebar-menu');
        this.contentArea = document.getElementById('main-content');
        this.userRole = null;
    }

    init() {
        const token = localStorage.getItem('hms_token');
        if (!token) return;

        const decoded = Utils.parseJwt(token);
        // Backend'in token içine rolü "role" veya "authorities" olarak koyduğunu varsayıyoruz.
        // Genelde spring security "roles" ya da "authorities" döner.
        // Burayı backend token yapısına göre güncellemek gerekebilir.
        this.userRole = decoded.role || decoded.authorities?.[0] || 'PATIENT';

        this.renderSidebar();
        this.loadPage('welcome'); // Varsayılan sayfa
    }

    renderSidebar() {
        let menuItems = [];

        // Ortak Menüler
        menuItems.push({ id: 'welcome', title: 'Ana Sayfa', icon: '🏠' });

        // Rol Bazlı Menüler
        if (this.userRole === Utils.ROLES.PATIENT) {
            menuItems.push(
                { id: 'appointment-create', title: 'Randevu Al', icon: '📅' },
                { id: 'my-appointments', title: 'Randevularım', icon: 'list' },
                { id: 'my-prescriptions', title: 'Reçetelerim', icon: '💊' }
            );
        }
        else if (this.userRole === Utils.ROLES.DOCTOR) {
            menuItems.push(
                { id: 'doc-appointments', title: 'Bekleyen Hastalar', icon: '👨‍⚕️' },
                { id: 'create-slot', title: 'Müsaitlik Oluştur', icon: '🕒' }
            );
        }
        else if (this.userRole === Utils.ROLES.ADMIN) {
            menuItems.push(
                { id: 'admin-users', title: 'Kullanıcı Yönetimi', icon: '👥' },
                { id: 'admin-polyclinics', title: 'Poliklinik Yönetimi', icon: '🏥' }
            );
        }

        // HTML Üretimi
        let html = '<ul class="nav flex-column">';
        menuItems.forEach(item => {
            html += `
                <li class="nav-item mb-2">
                    <a href="#" class="nav-link text-white" data-page="${item.id}">
                        <span class="me-2">${item.icon}</span> ${item.title}
                    </a>
                </li>
            `;
        });
        html += '</ul>';

        this.sidebar.innerHTML = html;

        // Tıklama olaylarını dinle
        this.sidebar.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pageId = e.currentTarget.getAttribute('data-page');
                this.loadPage(pageId);

                // Aktif class yönetimi
                this.sidebar.querySelectorAll('a').forEach(l => l.classList.remove('active', 'bg-secondary'));
                e.currentTarget.classList.add('active', 'bg-secondary');
            });
        });
    }

    loadPage(pageId) {
        this.contentArea.innerHTML = '<h3>Yükleniyor...</h3>';

        // Burada ileride switch-case ile ilgili modülleri çağıracağız.
        // Şimdilik placeholder (yer tutucu) koyuyoruz.
        setTimeout(() => {
            switch(pageId) {
                case 'welcome':
                    this.contentArea.innerHTML = `
                        <div class="p-5 mb-4 bg-light rounded-3">
                            <div class="container-fluid py-5">
                                <h1 class="display-5 fw-bold">Hoşgeldiniz</h1>
                                <p class="col-md-8 fs-4">Hastane Yönetim Sistemine başarıyla giriş yaptınız. Sol menüden işlemlerinizi gerçekleştirebilirsiniz.</p>
                            </div>
                        </div>`;
                    break;
                case 'appointment-create':
                    this.contentArea.innerHTML = `<h3>Randevu Alma Ekranı</h3><p>Buraya doktor listesi gelecek...</p>`;
                    break;
                default:
                    this.contentArea.innerHTML = `<h3>${pageId}</h3><p>Bu modül henüz yapım aşamasında.</p>`;
            }
        }, 300); // UI geçiş hissi için minik gecikme
    }
}