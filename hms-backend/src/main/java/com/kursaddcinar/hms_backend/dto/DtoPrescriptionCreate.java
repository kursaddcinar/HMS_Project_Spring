package com.kursaddcinar.hms_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoPrescriptionCreate {

    @NotBlank(message = "Randevu ID boş olamaz.")
    private String appointmentId;

    @NotBlank(message = "Tanı boş olamaz.")
    private String diagnosis;

    @NotEmpty(message = "En az bir ilaç yazılmalıdır.")
    private List<DtoPrescriptionItem> items;

    // Inner DTO for items
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DtoPrescriptionItem {
        @NotBlank
        private String drugName;
        private String dosage;
        private String instruction;
    }
}