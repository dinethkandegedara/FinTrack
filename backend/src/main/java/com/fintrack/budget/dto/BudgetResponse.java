package com.fintrack.budget.dto;

import com.fintrack.category.dto.CategoryResponse;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Public response DTO representing a monthly Budget including server-computed spending metrics.
 */
public class BudgetResponse {

    private Long id;
    private CategoryResponse category;
    private Integer budgetYear;
    private Integer budgetMonth;
    private BigDecimal amount;
    private BigDecimal spent;
    private BigDecimal remaining;
    private BigDecimal percentUsed;
    private LocalDateTime createdAt;

    public BudgetResponse() {
    }

    public BudgetResponse(
            Long id,
            CategoryResponse category,
            Integer budgetYear,
            Integer budgetMonth,
            BigDecimal amount,
            BigDecimal spent,
            BigDecimal remaining,
            BigDecimal percentUsed,
            LocalDateTime createdAt) {
        this.id = id;
        this.category = category;
        this.budgetYear = budgetYear;
        this.budgetMonth = budgetMonth;
        this.amount = amount;
        this.spent = spent;
        this.remaining = remaining;
        this.percentUsed = percentUsed;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CategoryResponse getCategory() {
        return category;
    }

    public void setCategory(CategoryResponse category) {
        this.category = category;
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

    public BigDecimal getSpent() {
        return spent;
    }

    public void setSpent(BigDecimal spent) {
        this.spent = spent;
    }

    public BigDecimal getRemaining() {
        return remaining;
    }

    public void setRemaining(BigDecimal remaining) {
        this.remaining = remaining;
    }

    public BigDecimal getPercentUsed() {
        return percentUsed;
    }

    public void setPercentUsed(BigDecimal percentUsed) {
        this.percentUsed = percentUsed;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
