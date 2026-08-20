package com.fintrack.user;

import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.user.dto.UpdateProfileRequest;
import com.fintrack.user.dto.UserResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service managing user account retrieval and profile updates.
 */
@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Retrieves the current user's profile by their unique ID.
     */
    @Transactional(readOnly = true)
    public UserResponse getUserProfile(Long userId) {
        User user = findUserById(userId);
        return mapToUserResponse(user);
    }

    /**
     * Updates profile details (full name) for the specified user.
     */
    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = findUserById(userId);
        user.setFullName(request.getFullName().trim());
        User updated = userRepository.save(user);
        return mapToUserResponse(updated);
    }

    /**
     * Internal helper to find a User entity or throw {@link ResourceNotFoundException}.
     */
    @Transactional(readOnly = true)
    public User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    /**
     * Maps a User JPA entity into a safe UserResponse DTO.
     */
    public UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getCreatedAt()
        );
    }
}
