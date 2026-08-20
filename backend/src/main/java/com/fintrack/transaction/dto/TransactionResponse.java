package com.fintrack.transaction.dto;

import com.fintrack.category.CategoryType;
import com.fintrack.category.dto.CategoryResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Public response DTO representing a Transaction.
 */
public class TransactionResponse {

    private Long id;
    private BigDecimal amount;
    private LocalDate transactionDate;
    private String description;
    private CategoryResponse category;
    private CategoryType type;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TransactionResponse() {
    }

    public TransactionResponse(
            Long id,
            BigDecimal amount,
            LocalDate transactionDate,
            String description,
            CategoryResponse category,
            CategoryType type,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        this.id = id;
        this.amount = amount;
        this.transactionDate = transactionDate;
        this.description = description;
        this.category = category;
        this.type = type;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDate transactionDate) {
        this.transactionDate = transactionDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public CategoryResponse getCategory() {
        return category;
    }

    public void setCategory(CategoryResponse category) {
        this.category = category;
    }

    public CategoryType getType() {
        return type;
    }

    public void setType(CategoryType type) {
        this.type = type;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
