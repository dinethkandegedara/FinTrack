package com.fintrack.user;

import com.fintrack.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * JPA Entity representing an application user in the `users` table.
 *
 * <p>Architectural decisions:
 * <ul>
 *   <li>Extends {@link BaseEntity} for common audit timestamps (createdAt, updatedAt) and primary key id.</li>
 *   <li><b>Unidirectional relationships:</b> No {@code @OneToMany} collections back to transactions,
 *       budgets, or categories are declared here. This prevents inadvertent full-table loads, eliminates
 *       LazyInitializationException hazards, and promotes explicit query access patterns via repositories.</li>
 *   <li>Passwords are stored strictly as BCrypt hashes; plain text is never persisted or logged.</li>
 * </ul>
 */
@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    public User() {
    }

    public User(String fullName, String email, String passwordHash) {
        this.fullName = fullName;
        this.email = email;
        this.passwordHash = passwordHash;
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

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }
}
