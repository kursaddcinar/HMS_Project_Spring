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
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users") // SQL'deki @Table("users") karşılığıdır.
public class User extends BaseEntity implements UserDetails {

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

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Kullanıcının rolünü Spring Security otoritesine çeviriyoruz.
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getUsername() {
        return username; // Kimlik doğrulama için hangi alanı kullandığımız (email de olabilirdi)
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Hesap süresi doldu mu? Şimdilik hayır.
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Hesap kilitli mi? Şimdilik hayır.
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Şifre süresi doldu mu? Şimdilik hayır.
    }

    @Override
    public boolean isEnabled() {
        return isActive; // Kullanıcı aktif mi? (Soft delete kontrolü)
    }
}