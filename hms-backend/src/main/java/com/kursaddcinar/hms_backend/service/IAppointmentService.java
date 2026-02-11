package com.kursaddcinar.hms_backend.service;

import com.kursaddcinar.hms_backend.data.entity.Appointment;
import com.kursaddcinar.hms_backend.dto.DtoAppointmentCreate;
import com.kursaddcinar.hms_backend.dto.DtoAppointmentResponse;

import java.util.List;

public interface IAppointmentService {

    // 1. Doktor için boş randevu saati oluştur
    Appointment createAppointmentSlot(DtoAppointmentCreate request);

    // 2. Hastanın var olan bir boşluğu kendine alması (Randevu Kesinleştirme)
    Appointment bookAppointment(String appointmentId, String patientId);

    // 3. Doktorun tüm randevularını getir (Dolu/Boş)
    List<Appointment> getAppointmentsByDoctor(String doctorId);

    // 4. Hastanın kendi randevularını getir
    List<DtoAppointmentResponse> getAppointmentsByPatient(String patientId);
}