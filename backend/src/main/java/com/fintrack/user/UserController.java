package com.fintrack.user;

import com.fintrack.security.SecurityUser;
import com.fintrack.user.dto.UpdateProfileRequest;
import com.fintrack.user.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller exposing user profile management endpoints.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Returns the currently authenticated user's profile.
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal SecurityUser currentUser) {
        UserResponse response = userService.getUserProfile(currentUser.getId());
        return ResponseEntity.ok(response);
    }

    /**
     * Updates the currently authenticated user's profile details.
     */
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal SecurityUser currentUser,
            @Valid @RequestBody UpdateProfileRequest request) {

        UserResponse response = userService.updateProfile(currentUser.getId(), request);
        return ResponseEntity.ok(response);
    }
}
