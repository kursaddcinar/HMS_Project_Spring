package com.kursaddcinar.hms_backend.service.impl;

import com.kursaddcinar.hms_backend.data.entity.Appointment;
import com.kursaddcinar.hms_backend.data.entity.Prescription;
import com.kursaddcinar.hms_backend.dto.DtoPrescriptionCreate;
import com.kursaddcinar.hms_backend.repository.IAppointmentRepository;
import com.kursaddcinar.hms_backend.repository.IPrescriptionRepository;
import com.kursaddcinar.hms_backend.service.IPrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrescriptionServiceImpl implements IPrescriptionService {

    private final IPrescriptionRepository prescriptionRepository;
    private final IAppointmentRepository appointmentRepository;

    @Override
    public Prescription createPrescription(DtoPrescriptionCreate request) {
        // 1. Randevuyu bul (Böyle bir randevu var mı?)
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Randevu bulunamadı."));

        // 2. Mapping: DTO -> Entity
        // İlaçları tek tek dönüştürüyoruz
        List<Prescription.PrescriptionItem> items = request.getItems().stream()
                .map(item -> Prescription.PrescriptionItem.builder()
                        .drugName(item.getDrugName())
                        .dosage(item.getDosage())
                        .instruction(item.getInstruction())
                        .build())
                .collect(Collectors.toList());

        // 3. Reçeteyi oluştur
        Prescription prescription = Prescription.builder()
                .appointmentId(appointment.getId())
                .doctorId(appointment.getDoctorId()) // Randevudaki doktordan alıyoruz
                .patientId(appointment.getPatientId()) // Randevudaki hastadan alıyoruz
                .diagnosis(request.getDiagnosis())
                .items(items)
                .build();

        return prescriptionRepository.save(prescription);
    }

    @Override
    public List<Prescription> getPrescriptionsByPatient(String patientId) {
        return prescriptionRepository.findByPatientId(patientId);
    }
}