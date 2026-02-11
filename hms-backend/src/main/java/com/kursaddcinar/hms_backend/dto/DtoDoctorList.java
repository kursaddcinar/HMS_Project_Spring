package com.kursaddcinar.hms_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// DtoDoctorList.java
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DtoDoctorList {
    private String id;
    private String firstName; // User'dan gelecek
    private String lastName;  // User'dan gelecek
    private String title;
    private String branch;
    private List<String> availableDays;
}