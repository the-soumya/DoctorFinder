package com.healthportal.security.services;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.healthportal.entity.Role;
import com.healthportal.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.Objects;

public class UserDetailsImpl implements UserDetails {

    private final Long id;
    private final String name;
    private final String email;
    @JsonIgnore
    private final String password;
    private final Role role;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(Long id, String name, String email, String password, Role role,
                           Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.authorities = authorities;
    }

    public static UserDetailsImpl build(User user) {
        GrantedAuthority authority = new SimpleGrantedAuthority(user.getRole().name());
        return new UserDetailsImpl(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getRole(),
                Collections.singletonList(authority)
        );
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Role getRole() {
        return role;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserDetailsImpl that = (UserDetailsImpl) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
