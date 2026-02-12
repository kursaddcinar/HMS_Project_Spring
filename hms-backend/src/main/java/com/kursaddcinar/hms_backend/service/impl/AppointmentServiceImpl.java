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
        // 1. Frontend bize Token'daki 'userId'yi gönderiyor.
        // Ancak Appointment tablosuna 'doctorId' kaydetmeliyiz.
        // Önce bu User ID'ye sahip doktoru bulalım.

        Doctor doctor = doctorRepository.findByUserId(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Bu kullanıcı bir doktor değil!"));

        // 2. Randevu Nesnesini Oluştur
        Appointment appointment = new Appointment();

        // DİKKAT: Request'ten gelen ID'yi değil, veritabanından bulduğumuz Doktorun ID'sini set ediyoruz.
        appointment.setDoctorId(doctor.getId());

        appointment.setAppointmentDate(request.getAppointmentDate());

        // Doktor slot açıyorsa bu 'Müsait' (AVAILABLE) olmalı, 'BOOKED' değil.
        appointment.setStatus(AppointmentStatus.AVAILABLE);

        appointment.setPatientId(null); // Henüz hasta yok

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
    public List<DtoAppointmentResponse> getAppointmentsByDoctor(String userIdOrDoctorId) {
        // 1. Önce gelen ID'nin Doctor tablosunda doğrudan bir ID olup olmadığına bak
        String realDoctorId = userIdOrDoctorId;
        if (!doctorRepository.existsById(userIdOrDoctorId)) {
            Doctor doc = doctorRepository.findByUserId(userIdOrDoctorId)
                    .orElseThrow(() -> new RuntimeException("Doktor bulunamadı"));
            realDoctorId = doc.getId();
        }

        // 2. Randevuları Çek
        List<Appointment> appointments = appointmentRepository.findByDoctorId(realDoctorId);

        // 3. DTO'ya Çevir ve Hasta Adını Ekle
        return appointments.stream().map(app -> {

            String patientName = "Müsait Slot"; // Eğer AVAILABLE ise hasta yoktur

            // Eğer randevu doluysa (BOOKED veya COMPLETED) hastayı bul
            if (app.getPatientId() != null) {
                User patient = userRepository.findById(app.getPatientId()).orElse(null);
                if (patient != null) {
                    patientName = patient.getFirstName() + " " + patient.getLastName();
                }
            }

            return DtoAppointmentResponse.builder()
                    .id(app.getId())
                    .appointmentDate(app.getAppointmentDate())
                    .status(app.getStatus().name())
                    .patientId(app.getPatientId())
                    .patientFullName(patientName) // <--- İŞTE BURASI
                    .build();

        }).collect(Collectors.toList());
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