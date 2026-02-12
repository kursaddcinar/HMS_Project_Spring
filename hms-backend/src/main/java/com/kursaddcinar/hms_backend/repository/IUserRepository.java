package com.kursaddcinar.hms_backend.repository;

import com.kursaddcinar.hms_backend.data.entity.Doctor;
import com.kursaddcinar.hms_backend.data.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IUserRepository extends MongoRepository<User, String> {

    // Kullanıcı adı (TCKN) ile kullanıcıyı bul (Login için)
    Optional<User> findByUsername(String username);

    // Kullanıcı adı daha önce alınmış mı? (Kayıt kontrolü için)
    boolean existsByUsername(String username);

    // Email kontrolü (Opsiyonel)
    boolean existsByEmail(String email);

}