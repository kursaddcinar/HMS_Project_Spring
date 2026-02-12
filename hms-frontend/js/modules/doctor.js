import { ApiService } from '../api.js';
import { Utils } from '../utils.js';

export class DoctorManager {

    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    // Doktorun Bekleyen Hastalarını Listele
    async renderIncomingPatients() {
        this.container.innerHTML = this.getLoadingSpinner();

        try {
            // 1. Token'dan User ID'yi al
            const token = ApiService.getToken();
            const user = Utils.parseJwt(token);

            if (!user || !user.userId) {
                throw new Error("Kullanıcı kimliği doğrulanamadı.");
            }

            // DİKKAT: Backend'de /appointments/doctor/{doctorId} endpoint'i var.
            // Ancak elimizde userId var. Backend bu mapping'i yapmalı.
            // Şimdilik userId gönderiyoruz, backend'de bunu karşılayacağız.
            const appointments = await ApiService.request(`/appointments/doctor/${user.userId}`, 'GET');

            if (!appointments || appointments.length === 0) {
                this.container.innerHTML = `
                    <div class="alert alert-info text-center">
                        Henüz bekleyen hasta randevunuz bulunmamaktadır.
                    </div>`;
                return;
            }

            let html = `
                <div class="card shadow-sm">
                    <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">👨‍⚕️ Randevu Listesi (Gelen Hastalar)</h5>
                        <span class="badge bg-light text-dark">${appointments.length} Randevu</span>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>Tarih / Saat</th>
                                    <th>Hasta Adı</th>
                                    <th>Durum</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.generateRows(appointments)}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            this.container.innerHTML = html;

        } catch (error) {
            this.container.innerHTML = `<div class="alert alert-danger">Veriler yüklenemedi: ${error.message}</div>`;
        }
    }

    generateRows(appointments) {
        return appointments.map(app => {
            const dateObj = new Date(app.appointmentDate);

            // --- EKSİK OLAN SATIR BURASIYDI ---
            const dateStr = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
            // ----------------------------------

            const timeStr = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

            const patientDisplay = app.patientFullName || 'Müsait Zaman Dilimi';

            const isBooked = app.status === 'BOOKED';
            const btnClass = isBooked ? 'btn-primary' : 'btn-secondary disabled';
            const btnText = isBooked ? '📝 Reçete Yaz' : '⛔ Bekleniyor';

            const rowClass = app.status === 'AVAILABLE' ? 'table-light text-muted' : '';

            // ID'yi tırnak içine alarak gönderiyoruz ('${app.id}')
            return `
                <tr class="${rowClass}">
                    <td>
                        <div class="fw-bold">${dateStr}</div>
                        <div class="small">${timeStr}</div>
                    </td>
                    <td>${patientDisplay}</td>
                    <td>
                        <span class="badge ${app.status === 'AVAILABLE' ? 'bg-info' : 'bg-warning text-dark'}">
                            ${app.status}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm ${btnClass}"
                                onclick="window.openPrescriptionModal('${app.id}')"
                                ${!isBooked ? 'disabled' : ''}>
                            ${btnText}
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    // Reçete Modal İşlemleri
   initPrescriptionModal() {
           // --- BU KISIM ÇOK ÖNEMLİ: Fonksiyonu Global Yapıyoruz ---
           window.openPrescriptionModal = (appointmentId) => {
               console.log("Modal açılıyor, ID:", appointmentId); // Kontrol için log

               // Modalı Seç
               const modalEl = document.getElementById('prescriptionModal');

               // Eğer Bootstrap JS yüklenmemişse burada hata verir
               if (typeof bootstrap === 'undefined') {
                   alert("Bootstrap JS yüklenmediği için modal açılamıyor!");
                   return;
               }

               const modal = new bootstrap.Modal(modalEl);

               // ID'yi inputa yaz
               document.getElementById('modal-appointment-id').value = appointmentId;

               // Formu Sıfırla
               document.getElementById('prescription-form').reset();
               document.getElementById('drug-list-container').innerHTML = '';
               this.addDrugInputRow(); // 1 tane boş satır ekle

               modal.show();
           };
           // -------------------------------------------------------

           // İlaç Ekle Butonu Dinleyicisi
           const addBtn = document.getElementById('add-drug-btn');
           // Önceki listener'ları temizlemek için (cloneNode hack) veya basitçe kontrol:
           if(addBtn) {
               addBtn.onclick = () => this.addDrugInputRow();
           }

           // Form Submit Dinleyicisi
           const form = document.getElementById('prescription-form');
           if(form) {
               form.onsubmit = async (e) => {
                   e.preventDefault();
                   await this.submitPrescription();
               };
           }
       }
    // Dinamik İlaç Satırı Ekleme
    addDrugInputRow() {
        const container = document.getElementById('drug-list-container');
        const div = document.createElement('div');
        div.className = 'input-group mb-2 drug-row';
        div.innerHTML = `
            <input type="text" class="form-control" name="drugName" placeholder="İlaç Adı (Örn: Parol)" required>
            <input type="text" class="form-control" name="dosage" placeholder="Doz (Örn: 2x1)" required>
            <input type="text" class="form-control" name="instruction" placeholder="Talimat (Örn: Tok karnına)">
            <button type="button" class="btn btn-outline-danger" onclick="this.parentElement.remove()">Sil</button>
        `;
        container.appendChild(div);
    }

    // Reçeteyi Backend'e Gönder
    async submitPrescription() {
        const appointmentId = document.getElementById('modal-appointment-id').value;
        const diagnosis = document.getElementById('diagnosis').value;

        // İlaçları Topla
        const drugRows = document.querySelectorAll('.drug-row');
        const items = Array.from(drugRows).map(row => {
            return {
                drugName: row.querySelector('[name="drugName"]').value,
                dosage: row.querySelector('[name="dosage"]').value,
                instruction: row.querySelector('[name="instruction"]').value
            };
        });

        if (items.length === 0) {
            alert("Lütfen en az bir ilaç ekleyin.");
            return;
        }

        const payload = {
            appointmentId: appointmentId,
            diagnosis: diagnosis,
            items: items
        };

        try {
            await ApiService.request('/prescriptions', 'POST', payload);

            alert("Reçete başarıyla kaydedildi! ✅");

            // Modalı Kapat
            const modalEl = document.getElementById('prescriptionModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();

            // --- EKLENECEK KISIM: LİSTEYİ YENİLE ---
            // Reçete yazıldıktan sonra butonun durumunu güncellemek için listeyi tekrar çekiyoruz.
            // İleride buraya sadece o satırı güncelleyen kod da yazılabilir.
            this.renderIncomingPatients();
            // ---------------------------------------

        } catch (error) {
            alert(`Reçete kaydedilemedi: ${error.message}`);
        }
        }

    getLoadingSpinner() {
        return '<div class="text-center mt-5"><div class="spinner-border text-success" role="status"></div><p>Hasta listesi yükleniyor...</p></div>';
    }

    // Müsaitlik (Slot) Oluşturma Ekranı
    renderCreateSlotPage() {
        this.container.innerHTML = `
            <div class="d-flex justify-content-center mt-4">
                <div class="card shadow-sm" style="width: 100%; max-width: 500px;">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">🕒 Müsaitlik (Slot) Ekle</h5>
                    </div>
                    <div class="card-body">
                        <form id="create-slot-form">
                            <div class="mb-3">
                                <label for="slotDate" class="form-label">Başlangıç Tarihi ve Saati</label>
                                <input type="datetime-local" class="form-control" id="slotDate" required>
                                <div class="form-text">Bu saatte randevu kabul edebileceğinizi belirtirsiniz.</div>
                            </div>

                            <div class="d-grid gap-2">
                                <button type="submit" class="btn btn-success">
                                    Kaydet ve Yayınla
                                </button>
                            </div>
                        </form>
                        <div id="slot-msg" class="mt-3"></div>
                    </div>
                </div>
            </div>
        `;

        this.attachSlotFormListener();
    }

    // Form Gönderim İşlemi
    attachSlotFormListener() {
        const form = document.getElementById('create-slot-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const dateInput = document.getElementById('slotDate');
            const dateVal = dateInput.value;
            const msgBox = document.getElementById('slot-msg');

            // Basit validasyon
            if (!dateVal) {
                msgBox.innerHTML = '<div class="alert alert-warning">Lütfen bir tarih seçin.</div>';
                return;
            }

            try {
                // 1. Doktorun kimliğini Token'dan al
                const token = ApiService.getToken();
                const user = Utils.parseJwt(token);

                if (!user || !user.userId) {
                    throw new Error("Oturum süresi dolmuş veya kullanıcı tanınmıyor.");
                }

                // 2. Backend'e gönderilecek veri
                const payload = {
                    doctorId: user.userId, // Token'dan gelen ID
                    appointmentDate: new Date(dateVal).toISOString() // ISO Format (yyyy-MM-ddTHH:mm:ss.sssZ)
                };

                msgBox.innerHTML = '<div class="spinner-border spinner-border-sm text-primary"></div> İşleniyor...';

                // 3. İstek at
                await ApiService.request('/appointments/create-slot', 'POST', payload);

                // 4. Başarılı
                msgBox.innerHTML = '<div class="alert alert-success">✅ Müsaitlik başarıyla oluşturuldu!</div>';
                form.reset(); // Formu temizle

            } catch (error) {
                msgBox.innerHTML = `<div class="alert alert-danger">Hata: ${error.message}</div>`;
            }
        });
    }
}