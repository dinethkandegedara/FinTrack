package com.fintrack.category;

/**
 * Enumeration of supported transaction and category classifications.
 *
 * <p>Persisted in the database via {@code @Enumerated(EnumType.STRING)} to ensure stability
 * against ordinal re-ordering.
 */
public enum CategoryType {
    INCOME,
    EXPENSE
}
