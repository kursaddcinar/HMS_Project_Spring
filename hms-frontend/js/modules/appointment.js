import { ApiService } from '../api.js';

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

            if(!doctorId || !dateVal) {
                msgBox.innerHTML = '<div class="alert alert-warning">Lütfen tüm alanları doldurun.</div>';
                return;
            }

            // Backend beklediği format: "yyyy-MM-dd'T'HH:mm:ss" (ISO benzeri)
            // datetime-local input zaten buna yakın format verir.

            const payload = {
                doctorId: doctorId,
                appointmentDate: new Date(dateVal).toISOString() // Backend LocalDateTime bekliyor olabilir, ISO format genelde güvenlidir.
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
}