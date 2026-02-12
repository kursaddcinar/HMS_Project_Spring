import { AuthService } from './auth.js';
import { Utils } from './utils.js';
import { AppointmentManager } from './modules/appointment.js';
import { DoctorManager } from './modules/doctor.js';


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
        // İçerik alanını temizle (ama loading koyma, modül kendisi halletsin)
        this.contentArea.innerHTML = '';

        switch(pageId) {
            case 'welcome':
                this.contentArea.innerHTML = `
                    <div class="p-5 mb-4 bg-light rounded-3">
                        <div class="container-fluid py-5">
                            <h1 class="display-5 fw-bold">Hoşgeldiniz</h1>
                            <p class="fs-4">Hastane Yönetim Sistemi paneline hoşgeldiniz.</p>
                        </div>
                    </div>`;
                break;

            case 'appointment-create':
                // Yeni Modülü Çağır
                const appointmentManager = new AppointmentManager('main-content');
                appointmentManager.renderCreatePage();
                break;

            case 'my-appointments':
                const listManager = new AppointmentManager('main-content');
                listManager.renderMyAppointments();
                break;

            case 'doc-appointments':
                const docManager = new DoctorManager('main-content');
                docManager.renderIncomingPatients();
                docManager.initPrescriptionModal();
                break;

            case 'create-slot':
                            const slotManager = new DoctorManager('main-content');
                            slotManager.renderCreateSlotPage();
                            break;

            case 'my-prescriptions':
                            // AppointmentManager içinde tanımladık
                            const presManager = new AppointmentManager('main-content');
                            presManager.renderMyPrescriptions();
                            break;

            default:
                this.contentArea.innerHTML = `<h3>${pageId}</h3><p>Bu sayfa yapım aşamasında.</p>`;
        }
    }
}