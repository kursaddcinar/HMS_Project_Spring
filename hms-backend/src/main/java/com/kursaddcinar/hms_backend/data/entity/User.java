package com.kursaddcinar.hms_backend.data.entity;


import com.kursaddcinar.hms_backend.data.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users") // SQL'deki @Table("users") karşılığıdır.
public class User extends BaseEntity {

    @Indexed(unique = true) // Bu alanın benzersiz olmasını sağlar (TCKN gibi).
    @Field(name = "username") // Veritabanında sütun adı 'username' olsun.
    private String username; // TCKN veya Email olabilir, benzersiz kimlik.

    private String password;

    private String firstName;
    private String lastName;

    private String email;

    private String phone;

    private Role role; // Enum yapısı

    private boolean isActive = true; // Soft delete mantığı için
}