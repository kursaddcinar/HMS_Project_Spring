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
            // Doktorları Çek
            const doctors = await ApiService.request('/doctors/list', 'GET');

            let html = `
                <div class="card shadow-sm">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">📅 Randevu Al</h5>
                    </div>
                    <div class="card-body">
                        <form id="appointment-step-1">
                            <div class="mb-3">
                                <label for="doctorSelect" class="form-label">Doktor Seçiniz</label>
                                <select class="form-select" id="doctorSelect" required>
                                    <option value="" selected disabled>Lütfen bir doktor seçiniz...</option>
                                    ${this.generateDoctorOptions(doctors)}
                                </select>
                            </div>
                        </form>

                        <div id="slots-container" class="mt-4 d-none">
                            <h6 class="border-bottom pb-2">Müsait Randevu Saatleri</h6>
                            <div id="slots-grid" class="d-flex flex-wrap gap-2"></div>
                            <div id="no-slot-msg" class="alert alert-warning mt-2 d-none">Bu doktor için müsait zaman bulunamadı.</div>
                        </div>
                    </div>
                </div>
            `;

            this.container.innerHTML = html;
            this.attachDoctorSelectListener();

        } catch (error) {
            this.container.innerHTML = `<div class="alert alert-danger">Hata: ${error.message}</div>`;
        }
    }

    // Doktor Seçilince Slotları Getir
    attachDoctorSelectListener() {
        const select = document.getElementById('doctorSelect');
        const slotsContainer = document.getElementById('slots-container');
        const slotsGrid = document.getElementById('slots-grid');
        const noSlotMsg = document.getElementById('no-slot-msg');

        select.addEventListener('change', async (e) => {
            const doctorId = e.target.value;

            // UI Temizliği
            slotsGrid.innerHTML = '<div class="spinner-border spinner-border-sm text-primary"></div> Yükleniyor...';
            slotsContainer.classList.remove('d-none');
            noSlotMsg.classList.add('d-none');

            try {
                // Doktorun tüm randevularını çek
                // NOT: Backend'deki 'getAppointmentsByDoctor' metodun DoctorID bekliyordu.
                // Seçilen value zaten DoctorID olduğu için sorun yok.
                const appointments = await ApiService.request(`/appointments/doctor/${doctorId}`, 'GET');

                // Sadece AVAILABLE (Boş) ve gelecekteki slotları filtrele
                const availableSlots = appointments.filter(app =>
                    app.status === 'AVAILABLE' && new Date(app.appointmentDate) > new Date()
                );

                slotsGrid.innerHTML = '';

                if (availableSlots.length === 0) {
                    noSlotMsg.classList.remove('d-none');
                    return;
                }

                // Slotları Buton Olarak Bas
                availableSlots.forEach(slot => {
                    const dateObj = new Date(slot.appointmentDate);
                    const timeStr = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                    const dateStr = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });

                    const btn = document.createElement('button');
                    btn.className = 'btn btn-outline-primary position-relative';
                    btn.innerHTML = `<strong>${timeStr}</strong><br><small>${dateStr}</small>`;

                    // Tıklayınca Randevuyu Al (Book)
                    btn.onclick = () => this.bookAppointment(slot.id);

                    slotsGrid.appendChild(btn);
                });

            } catch (error) {
                slotsGrid.innerHTML = `<span class="text-danger">Saatler yüklenemedi: ${error.message}</span>`;
            }
        });
    }

    // Randevuyu Kesinleştir (Book işlemi)
    async bookAppointment(appointmentId) {
        if(!confirm("Bu randevuyu onaylıyor musunuz?")) return;

        try {
            const token = ApiService.getToken();
            const user = Utils.parseJwt(token);

            // Backend Endpoint: /appointments/book/{appointmentId}?patientId={patientId}
            // Bu endpointi henüz backend'de kontrol etmedik, aşağıda kontrol edeceğiz.
            await ApiService.request(`/appointments/book/${appointmentId}?patientId=${user.userId}`, 'POST');

            alert("Randevunuz başarıyla oluşturuldu! 'Randevularım' menüsünden görebilirsiniz.");

            // Sayfayı yenile veya listeye yönlendir
            // document.querySelector('[data-page=my-appointments]').click();
            // (Dashboard yapımıza göre manuel tetikleme gerekebilir, şimdilik basit reload:)
            window.location.reload();

        } catch (error) {
            alert(`İşlem başarısız: ${error.message}`);
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

    async renderMyPrescriptions() {
        this.container.innerHTML = this.getLoadingSpinner();

        try {
            const token = ApiService.getToken();
            const user = Utils.parseJwt(token);

            // Backend: /prescriptions/patient/{patientId}
            const prescriptions = await ApiService.request(`/prescriptions/patient/${user.userId}`, 'GET');

            if (prescriptions.length === 0) {
                this.container.innerHTML = `
                    <div class="alert alert-info text-center">
                        Henüz adınıza yazılmış bir reçete bulunmamaktadır.
                    </div>`;
                return;
            }

            let html = `
                <div class="card shadow-sm">
                    <div class="card-header bg-danger text-white">
                        <h5 class="mb-0">💊 Reçetelerim</h5>
                    </div>
                    <div class="accordion" id="prescriptionAccordion">
                        ${this.generatePrescriptionItems(prescriptions)}
                    </div>
                </div>
            `;
            this.container.innerHTML = html;

        } catch (error) {
            this.container.innerHTML = `<div class="alert alert-danger">Reçeteler yüklenemedi: ${error.message}</div>`;
        }
    }

    generatePrescriptionItems(list) {
        return list.map((pres, index) => {
            const dateStr = new Date(pres.createdDate).toLocaleDateString('tr-TR');
            // Backend'den doktor adı gelmezse ID yazarız (İleride DTO ile düzeltilir)
            const doctorInfo = pres.doctorId ? `Doktor ID: ${pres.doctorId}` : 'Bilinmeyen Doktor';

            // İlaçları Listele
            const drugsHtml = pres.items.map(drug => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${drug.drugName}</strong>
                        <div class="text-muted small">${drug.instruction || ''}</div>
                    </div>
                    <span class="badge bg-secondary rounded-pill">${drug.dosage}</span>
                </li>
            `).join('');

            return `
                <div class="accordion-item">
                    <h2 class="accordion-header" id="heading${index}">
                        <button class="accordion-button ${index !== 0 ? 'collapsed' : ''}" type="button"
                                data-bs-toggle="collapse" data-bs-target="#collapse${index}">
                            <div class="d-flex w-100 justify-content-between me-3">
                                <span>📅 ${dateStr} - <strong>${pres.diagnosis || 'Tanı Yok'}</strong></span>
                            </div>
                        </button>
                    </h2>
                    <div id="collapse${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}"
                         data-bs-parent="#prescriptionAccordion">
                        <div class="accordion-body">
                            <h6 class="text-muted mb-2">Yazan: ${doctorInfo}</h6>
                            <ul class="list-group list-group-flush">
                                ${drugsHtml}
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}