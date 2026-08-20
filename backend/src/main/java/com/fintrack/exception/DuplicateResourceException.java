package com.fintrack.exception;

/**
 * Exception thrown when an action would violate a business uniqueness constraint (e.g. duplicate email,
 * duplicate category name of same type, or duplicate budget for the same month).
 *
 * <p>Maps to HTTP 409 Conflict.
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
