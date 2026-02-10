package com.kursaddcinar.hms_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoUserRegister {

    // Validasyon anotasyonları (Spring Validation)
    // Veri daha servise girmeden kontrol edilir.

    @NotBlank(message = "Kullanıcı adı boş geçilemez.")
    @Size(min = 3, max = 50)
    private String username;

    @NotBlank(message = "Şifre boş geçilemez.")
    @Size(min = 6, message = "Şifre en az 6 karakter olmalıdır.")
    private String password;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @Email(message = "Geçerli bir e-posta adresi giriniz.")
    private String email;

    // Role alanını kullanıcıdan almıyoruz, varsayılan atayacağız.
}