package com.fintrack.exception;

/**
 * Exception thrown when a client request violates a business rule (e.g. attempting to create a budget
 * on an INCOME category, or illegal parameter combinations).
 *
 * <p>Maps to HTTP 400 Bad Request.
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
