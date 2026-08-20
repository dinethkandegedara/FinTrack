package com.fintrack.auth;

import com.fintrack.auth.dto.AuthResponse;
import com.fintrack.auth.dto.LoginRequest;
import com.fintrack.auth.dto.RegisterRequest;
import com.fintrack.exception.DuplicateResourceException;
import com.fintrack.security.JwtTokenProvider;
import com.fintrack.security.SecurityUser;
import com.fintrack.user.User;
import com.fintrack.user.UserRepository;
import com.fintrack.user.UserService;
import com.fintrack.user.dto.UserResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserService userService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("Alice Walker", "alice@example.com", "$2a$10$hashedPassword");
        sampleUser.setId(1L);
        sampleUser.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should successfully register a new user when email is unique")
    void register_Success() {
        RegisterRequest request = new RegisterRequest("Alice Walker", "alice@example.com", "password123");
        UserResponse expectedResponse = new UserResponse(1L, "Alice Walker", "alice@example.com", sampleUser.getCreatedAt());

        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$10$hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(userService.mapToUserResponse(sampleUser)).thenReturn(expectedResponse);

        UserResponse result = authService.register(request);

        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("alice@example.com");
        assertThat(result.getFullName()).isEqualTo("Alice Walker");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when registering with an existing email")
    void register_DuplicateEmail_ThrowsException() {
        RegisterRequest request = new RegisterRequest("Alice Walker", "alice@example.com", "password123");

        when(userRepository.existsByEmail("alice@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already exists");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully login and return JWT with user details")
    void login_Success() {
        LoginRequest request = new LoginRequest("alice@example.com", "password123");
        Authentication authentication = mock(Authentication.class);
        UserResponse userResponse = new UserResponse(1L, "Alice Walker", "alice@example.com", sampleUser.getCreatedAt());

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(tokenProvider.generateToken(authentication)).thenReturn("mocked.jwt.token");
        when(tokenProvider.getExpirationDurationMs()).thenReturn(86400000L);
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(sampleUser));
        when(userService.mapToUserResponse(sampleUser)).thenReturn(userResponse);

        AuthResponse result = authService.login(request);

        assertThat(result).isNotNull();
        assertThat(result.getToken()).isEqualTo("mocked.jwt.token");
        assertThat(result.getUser().getEmail()).isEqualTo("alice@example.com");
    }

    @Test
    @DisplayName("Should throw BadCredentialsException on invalid login credentials")
    void login_BadCredentials_ThrowsException() {
        LoginRequest request = new LoginRequest("alice@example.com", "wrongpassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class);
    }
}
