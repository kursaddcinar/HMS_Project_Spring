package com.kursaddcinar.hms_backend.service;

import com.kursaddcinar.hms_backend.data.entity.Prescription;
import com.kursaddcinar.hms_backend.dto.DtoPrescriptionCreate;

import java.util.List;

public interface IPrescriptionService {
    Prescription createPrescription(DtoPrescriptionCreate request);
    List<Prescription> getPrescriptionsByPatient(String patientId);
}