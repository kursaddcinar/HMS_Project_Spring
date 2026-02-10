package com.kursaddcinar.hms_backend.data.enums;

public enum Title {
    PRATISYEN("Pratisyen Hekim"),
    UZMAN("Uzman Doktor"),
    OPERATOR("Operatör Doktor"),
    DOCENT("Doçent Doktor"),
    PROFESOR("Profesör Doktor");

    private final String label;

    Title(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}