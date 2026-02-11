package com.kursaddcinar.hms_backend.service.impl;

import com.kursaddcinar.hms_backend.data.entity.Appointment;
import com.kursaddcinar.hms_backend.data.entity.Doctor;
import com.kursaddcinar.hms_backend.data.entity.User;
import com.kursaddcinar.hms_backend.data.enums.AppointmentStatus;
import com.kursaddcinar.hms_backend.dto.DtoAppointmentCreate;
import com.kursaddcinar.hms_backend.dto.DtoAppointmentResponse;
import com.kursaddcinar.hms_backend.repository.IAppointmentRepository;
import com.kursaddcinar.hms_backend.repository.IDoctorRepository;
import com.kursaddcinar.hms_backend.repository.IUserRepository;
import com.kursaddcinar.hms_backend.service.IAppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements IAppointmentService {

    private final IAppointmentRepository appointmentRepository;
    private final IDoctorRepository doctorRepository;
    private final IUserRepository userRepository;

    @Override
    public Appointment createAppointmentSlot(DtoAppointmentCreate request) {
        // 1. Çakışma Kontrolü: Doktorun o saatte zaten bir kaydı var mı?
        boolean isExists = appointmentRepository.existsByDoctorIdAndAppointmentDateAndStatus(
                request.getDoctorId(),
                request.getAppointmentDate(),
                AppointmentStatus.AVAILABLE
        );

        if (isExists) {
            throw new RuntimeException("Bu saatte zaten bir randevu slotu mevcut.");
        }

        // 2. Yeni boş slot oluştur
        Appointment appointment = Appointment.builder()
                .doctorId(request.getDoctorId())
                .patientId(request.getPatientId())
                .appointmentDate(request.getAppointmentDate())
                .status(AppointmentStatus.AVAILABLE) // Başlangıçta MÜSAİT
                .build();

        return appointmentRepository.save(appointment);
    }

    @Override
    @Transactional // Veri tutarlılığı için önemli
    public Appointment bookAppointment(String appointmentId, String patientId) {
        // 1. Randevuyu bul
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Randevu bulunamadı."));

        // 2. Müsait mi kontrol et? (Başkası kapmış olabilir)
        if (!AppointmentStatus.AVAILABLE.equals(appointment.getStatus())) {
            throw new RuntimeException("Bu randevu dolu veya iptal edilmiş.");
        }

        // 3. Randevuyu hastaya ata ve durumunu güncelle
        appointment.setPatientId(patientId);
        appointment.setStatus(AppointmentStatus.BOOKED);
        appointment.setLastModifiedDate(LocalDateTime.now());

        return appointmentRepository.save(appointment);
    }

    @Override
    public List<Appointment> getAppointmentsByDoctor(String doctorId) {
        // Doktorun sadece AVAILABLE olanlarını mı yoksa hepsini mi göreceği filtreleme ile yapılabilir.
        // Şimdilik hepsini dönüyoruz.
        // TODO: IAppointmentRepository'ye 'findByDoctorId' metodunu eklememiz gerekebilir (Interface'e eklemiştik ama kontrol etmeliyiz).
        // Eğer IAppointmentRepository'de findByDoctorId yoksa eklemelisin.
        // Biz findByDoctorIdAndStatus eklemiştik, düzeltme yapıyorum:

        return appointmentRepository.findByDoctorIdAndStatus(doctorId, AppointmentStatus.AVAILABLE);
        // Şimdilik sadece boşları döndürelim, mantıken takvimde boş yerleri görmek isteriz.
    }

    @Override
    public List<DtoAppointmentResponse> getAppointmentsByPatient(String patientId) {
        // 1. Hastanın randevularını çek
        List<Appointment> appointments = appointmentRepository.findByPatientId(patientId);

        // 2. Her bir randevuyu DTO'ya map'le
        return appointments.stream().map(appointment -> {

            // Doktor Detaylarını Bul (Null check önemli)
            Doctor doctor = doctorRepository.findById(appointment.getDoctorId()).orElse(null);
            String doctorName = "Bilinmiyor";
            String branch = "-";

            if (doctor != null) {
                User docUser = userRepository.findById(doctor.getUserId()).orElse(null);
                branch = doctor.getBranch();
                if (docUser != null) {
                    doctorName = doctor.getTitle() + " " + docUser.getFirstName() + " " + docUser.getLastName();
                }
            }

            // DTO Oluştur
            return DtoAppointmentResponse.builder()
                    .id(appointment.getId())
                    .appointmentDate(appointment.getAppointmentDate())
                    .status(appointment.getStatus().name())
                    .doctorId(appointment.getDoctorId())
                    .doctorFullName(doctorName) // Artık isim var!
                    .doctorBranch(branch)
                    .build();

        }).collect(Collectors.toList());
    }
}