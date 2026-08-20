package com.fintrack.exception;

/**
 * Exception thrown when a requested resource does not exist or does not belong to the current authenticated user.
 *
 * <p>Returning 404 Not Found (instead of 403 Forbidden) prevents exposing the existence of resources
 * belonging to other users, preventing unauthorized enumeration attacks.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue));
    }
}
