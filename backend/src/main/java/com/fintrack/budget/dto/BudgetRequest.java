package com.fintrack.budget.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

/**
 * Request DTO for creating or modifying a monthly budget.
 */
public class BudgetRequest {

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "Budget year is required")
    @Min(value = 2000, message = "Budget year must be 2000 or later")
    @Max(value = 2100, message = "Budget year must be 2100 or earlier")
    private Integer budgetYear;

    @NotNull(message = "Budget month is required")
    @Min(value = 1, message = "Budget month must be between 1 and 12")
    @Max(value = 12, message = "Budget month must be between 1 and 12")
    private Integer budgetMonth;

    @NotNull(message = "Budget amount is required")
    @DecimalMin(value = "0.01", message = "Budget amount must be strictly greater than zero")
    @Digits(integer = 10, fraction = 2, message = "Budget amount must have at most 10 integer digits and 2 decimal places")
    private BigDecimal amount;

    public BudgetRequest() {
    }

    public BudgetRequest(Long categoryId, Integer budgetYear, Integer budgetMonth, BigDecimal amount) {
        this.categoryId = categoryId;
        this.budgetYear = budgetYear;
        this.budgetMonth = budgetMonth;
        this.amount = amount;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Integer getBudgetYear() {
        return budgetYear;
    }

    public void setBudgetYear(Integer budgetYear) {
        this.budgetYear = budgetYear;
    }

    public Integer getBudgetMonth() {
        return budgetMonth;
    }

    public void setBudgetMonth(Integer budgetMonth) {
        this.budgetMonth = budgetMonth;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
