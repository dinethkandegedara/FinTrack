package com.fintrack.auth;

import com.fintrack.auth.dto.AuthResponse;
import com.fintrack.auth.dto.LoginRequest;
import com.fintrack.auth.dto.RegisterRequest;
import com.fintrack.exception.DuplicateResourceException;
import com.fintrack.security.JwtTokenProvider;
import com.fintrack.user.User;
import com.fintrack.user.UserRepository;
import com.fintrack.user.UserService;
import com.fintrack.user.dto.UserResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service managing user registration and authentication logic.
 *
 * <p>Separation of Concerns:
 * <ul>
 *   <li>{@code auth} owns the <i>act</i> of registering and logging in.</li>
 *   <li>{@code user} owns the profile entity and account state.</li>
 *   <li>{@code auth} depends on {@code user}, never the reverse.</li>
 * </ul>
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(
            UserRepository userRepository,
            UserService userService,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    /**
     * Registers a new user with BCrypt hashed password and verifies email uniqueness.
     */
    @Transactional
    public UserResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateResourceException("An account with email " + normalizedEmail + " already exists");
        }

        User user = new User(
                request.getFullName().trim(),
                normalizedEmail,
                passwordEncoder.encode(request.getPassword())
        );

        User savedUser = userRepository.save(user);
        return userService.mapToUserResponse(savedUser);
    }

    /**
     * Authenticates user credentials via Spring Security and issues a signed JWT.
     */
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found after successful authentication"));

        return new AuthResponse(
                jwt,
                tokenProvider.getExpirationDurationMs(),
                userService.mapToUserResponse(user)
        );
    }
}
