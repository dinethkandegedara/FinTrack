/**
 * User account domain model matching backend UserResponse DTO.
 */
export interface User {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
}

/**
 * Request payload for updating user profile.
 */
export interface UpdateProfileRequest {
  fullName: string;
}
