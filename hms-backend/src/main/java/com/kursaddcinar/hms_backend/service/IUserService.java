package com.kursaddcinar.hms_backend.service;

import com.kursaddcinar.hms_backend.dto.DtoUserRegister;
import com.kursaddcinar.hms_backend.data.entity.User;

public interface IUserService {
    // Şimdilik sadece kayıt metodunu tanımlıyoruz.
    // Dönüş tipi olarak Entity (User) dönüyorum ki Controller katmanında
    // veya testlerde sonucunu görebilelim. İleride bunu da DTO'ya çevireceğiz.
    User register(DtoUserRegister registerDto);
}