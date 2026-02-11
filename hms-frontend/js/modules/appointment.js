import { ApiService } from '../api.js';
import { Utils } from '../utils.js';

export class AppointmentManager {

    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    // Randevu Alma Ekranını Render Et
    async renderCreatePage() {
        this.container.innerHTML = this.getLoadingSpinner();

        try {
            // 1. Doktorları Backend'den Çek
            const doctors = await ApiService.request('/doctors/list', 'GET');

            // 2. HTML Formunu Oluştur
            let html = `
                <div class="card shadow-sm">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">Yeni Randevu Al</h5>
                    </div>
                    <div class="card-body">
                        <form id="appointment-form">
                            <div class="mb-3">
                                <label for="doctorSelect" class="form-label">Doktor Seçin</label>
                                <select class="form-select" id="doctorSelect" required>
                                    <option value="" selected disabled>Lütfen bir doktor seçiniz...</option>
                                    ${this.generateDoctorOptions(doctors)}
                                </select>
                            </div>

                            <div class="mb-3">
                                <label for="appointmentDate" class="form-label">Randevu Tarihi ve Saati</label>
                                <input type="datetime-local" class="form-control" id="appointmentDate" required>
                                <div class="form-text">Lütfen mesai saatleri içinde bir zaman seçiniz.</div>
                            </div>

                            <button type="submit" class="btn btn-success">
                                Randevu Oluştur
                            </button>
                        </form>
                        <div id="msg-box" class="mt-3"></div>
                    </div>
                </div>
            `;

            this.container.innerHTML = html;

            // Event Listener Ekle
            this.attachFormListener();

        } catch (error) {
            this.container.innerHTML = `<div class="alert alert-danger">Doktor listesi yüklenemedi: ${error.message}</div>`;
        }
    }

    // Doktorları <option> formatına çevir
    generateDoctorOptions(doctors) {
        if (!doctors || doctors.length === 0) return '';

        return doctors.map(doc => {
            // Unvan ve İsim birleştirme (Örn: UZMAN Ahmet Yılmaz)
            const fullName = `${doc.title ? doc.title : ''} ${doc.firstName} ${doc.lastName} - ${doc.branch}`;
            return `<option value="${doc.id}">${fullName}</option>`;
        }).join('');
    }

    // Form Gönderimi (Submit)
    attachFormListener() {
        const form = document.getElementById('appointment-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const doctorId = document.getElementById('doctorSelect').value;
            const dateVal = document.getElementById('appointmentDate').value;
            const msgBox = document.getElementById('msg-box');

            const token = ApiService.getToken();
            const user = Utils.parseJwt(token);

            if(!doctorId || !dateVal) {
                msgBox.innerHTML = '<div class="alert alert-warning">Lütfen tüm alanları doldurun.</div>';
                return;
            }

            // Backend beklediği format: "yyyy-MM-dd'T'HH:mm:ss" (ISO benzeri)
            // datetime-local input zaten buna yakın format verir.

            const payload = {
                doctorId: doctorId,
                appointmentDate: new Date(dateVal).toISOString(), // Backend LocalDateTime bekliyor olabilir, ISO format genelde güvenlidir.
                patientId: user.userId
            };

            try {
                // Backend Endpoint: /appointments/create-slot
                await ApiService.request('/appointments/create-slot', 'POST', payload);

                msgBox.innerHTML = '<div class="alert alert-success">Randevu talebiniz başarıyla oluşturuldu!</div>';
                form.reset();
            } catch (error) {
                msgBox.innerHTML = `<div class="alert alert-danger">Randevu oluşturulamadı: ${error.message}</div>`;
            }
        });
    }

    getLoadingSpinner() {
        return '<div class="text-center mt-5"><div class="spinner-border text-primary" role="status"></div><p>Veriler yükleniyor...</p></div>';
    }

    async renderMyAppointments() {
        this.container.innerHTML = this.getLoadingSpinner();

        try {
            // 1. Token'dan User ID'yi al
            const token = ApiService.getToken();
            const user = Utils.parseJwt(token);

            if (!user || !user.userId) {
                throw new Error("Kullanıcı kimliği doğrulanamadı.");
            }

            // 2. Backend'den Randevuları Çek
            // Endpoint: /appointments/patient/{patientId}
            const appointments = await ApiService.request(`/appointments/patient/${user.userId}`, 'GET');

            // 3. Tabloyu Render Et
            if (appointments.length === 0) {
                this.container.innerHTML = `
                    <div class="alert alert-info text-center">
                        Henüz hiç randevunuz bulunmamaktadır. <br>
                        <a href="#" class="alert-link" onclick="document.querySelector('[data-page=appointment-create]').click()">Hemen randevu alın.</a>
                    </div>`;
                return;
            }

            let html = `
                <div class="card shadow-sm">
                    <div class="card-header bg-secondary text-white">
                        <h5 class="mb-0">Geçmiş ve Gelecek Randevularım</h5>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover table-striped mb-0">
                            <thead>
                                <tr>
                                    <th>Tarih</th>
                                    <th>Saat</th>
                                    <th>Doktor</th>
                                    <th>Durum</th>
                                    <th>İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.generateTableRows(appointments)}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            this.container.innerHTML = html;

        } catch (error) {
            this.container.innerHTML = `<div class="alert alert-danger">Randevular yüklenemedi: ${error.message}</div>`;
        }
    }

    generateTableRows(appointments) {
        return appointments.map(app => {
            const dateObj = new Date(app.appointmentDate);
            const dateStr = dateObj.toLocaleDateString('tr-TR');
            const timeStr = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

            let statusBadge = 'bg-primary';
            if(app.status === 'CANCELLED') statusBadge = 'bg-danger';
            if(app.status === 'COMPLETED') statusBadge = 'bg-success';
            if(app.status === 'AVAILABLE') statusBadge = 'bg-info'; // Boş slot ise

            // Backend'den gelen yeni alanları kullanıyoruz:
            const doctorDisplay = app.doctorFullName
                ? `${app.doctorFullName} <br> <small class="text-muted">${app.doctorBranch}</small>`
                : 'Bilinmeyen Doktor';

            return `
                <tr>
                    <td>${dateStr}</td>
                    <td>${timeStr}</td>
                    <td>${doctorDisplay}</td>
                    <td><span class="badge ${statusBadge}">${app.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger"
                                onclick="alert('İptal işlemi henüz aktif değil')"
                                ${app.status === 'CANCELLED' || app.status === 'COMPLETED' ? 'disabled' : ''}>
                            İptal
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
}