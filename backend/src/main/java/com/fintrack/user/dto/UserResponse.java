package com.fintrack.user.dto;

import java.time.LocalDateTime;

/**
 * Public User Data Transfer Object (DTO) for returning user details safely.
 *
 * <p>Never exposes sensitive fields such as {@code passwordHash}.
 */
public class UserResponse {

    private Long id;
    private String fullName;
    private String email;
    private LocalDateTime createdAt;

    public UserResponse() {
    }

    public UserResponse(Long id, String fullName, String email, LocalDateTime createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
