import { ApiService } from '../api.js';

export class AdminManager {

    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    // --- DOKTOR YÖNETİMİ ---

    // Tüm Doktorları Listele
    async renderDoctorManagement() {
        this.container.innerHTML = this.getLoadingSpinner();

        try {
            // Backend: /doctors/list
            const doctors = await ApiService.request('/doctors/list', 'GET');

            let html = `
                <div class="card shadow-sm">
                    <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">👨‍⚕️ Doktor Yönetimi</h5>
                        <button class="btn btn-sm btn-success" onclick="window.openAddDoctorModal()">
                            + Yeni Doktor Ekle
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>Unvan / Ad Soyad</th>
                                    <th>Branş</th>
                                    <th>Diploma No</th>
                                    <th>Durum</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.generateDoctorRows(doctors)}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            this.container.innerHTML = html;

            // Modal'ı başlat (Bir sonraki adımda içini dolduracağız)
            this.initAddDoctorModal();

        } catch (error) {
            this.container.innerHTML = `<div class="alert alert-danger">Doktor listesi yüklenemedi: ${error.message}</div>`;
        }
    }

    generateDoctorRows(doctors) {
        if (!doctors || doctors.length === 0) {
            return '<tr><td colspan="5" class="text-center">Sistemde kayıtlı doktor bulunmamaktadır.</td></tr>';
        }

        return doctors.map(doc => {
            // Backend DTO yapımıza göre (firstName, lastName geliyor mu kontrol etmiştik)
            const fullName = `${doc.title || ''} ${doc.firstName} ${doc.lastName}`;

            return `
                <tr>
                    <td>
                        <div class="fw-bold">${fullName}</div>
                        <div class="small text-muted">ID: ${doc.id.substring(0, 8)}...</div>
                    </td>
                    <td><span class="badge bg-info text-dark">${doc.branch}</span></td>
                    <td>${doc.diplomaNo || '-'}</td>
                    <td>
                        <span class="badge bg-success">Aktif</span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="alert('Düzenleme yakında...')">✏️</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="alert('Silme yakında...')">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Modal Başlatıcı (Şimdilik boş, buton çalışsın diye koyduk)
    // Modal Başlatıcı
    initAddDoctorModal() {
        // 1. Modalı Açma Fonksiyonunu Global Yap
        window.openAddDoctorModal = () => {
             const modalEl = document.getElementById('addDoctorModal');
             if(modalEl) {
                 const modal = new bootstrap.Modal(modalEl);
                 // Formu temizle
                 document.getElementById('add-doctor-form').reset();
                 document.getElementById('add-doc-msg').innerHTML = '';
                 modal.show();
             }
        };

        // 2. Form Submit Dinleyicisi
        const form = document.getElementById('add-doctor-form');
        if(form) {
            // "onsubmit" kullanarak önceki listener'ları ezmek daha güvenlidir (SPA mantığında)
            form.onsubmit = async (e) => {
                e.preventDefault();
                await this.submitAddDoctor(form);
            };
        }
    }

    // Backend'e İstek Atan Metot
    async submitAddDoctor(form) {
        const msgBox = document.getElementById('add-doc-msg');
        msgBox.innerHTML = '<div class="spinner-border spinner-border-sm text-success"></div> İşleniyor...';

        // Form Verilerini Topla (FormData API)
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        // Backend DTO yapısına uygun mu kontrol edelim:
        // DtoDoctorCreate: { firstName, lastName, username, password, email, branch, title, diplomaNo, biography }
        // Bizim form name'leri ile DTO alanları birebir örtüşüyor. Ekstra işlem gerekmez.

        try {
            // Endpoint: /doctors/add (POST)
            await ApiService.request('/doctors/add', 'POST', payload);

            // Başarılı
            msgBox.innerHTML = '<div class="alert alert-success">✅ Doktor başarıyla eklendi!</div>';

            // Modalı Kapat (Kısa bir süre sonra)
            setTimeout(() => {
                const modalEl = document.getElementById('addDoctorModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();

                // Listeyi Yenile (En son eklenen görünsün)
                this.renderDoctorManagement();
            }, 1500);

        } catch (error) {
            msgBox.innerHTML = `<div class="alert alert-danger">Hata: ${error.message}</div>`;
        }
    }

    getLoadingSpinner() {
        return '<div class="text-center mt-5"><div class="spinner-border text-dark" role="status"></div><p>Yükleniyor...</p></div>';
    }
}