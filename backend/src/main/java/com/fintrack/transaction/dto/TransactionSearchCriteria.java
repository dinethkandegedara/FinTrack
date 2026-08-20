package com.fintrack.transaction.dto;

import com.fintrack.category.CategoryType;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

/**
 * Filter criteria DTO capturing query parameters for searching and filtering transactions.
 */
public class TransactionSearchCriteria {

    private CategoryType type;
    private Long categoryId;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endDate;

    private String keyword;

    public TransactionSearchCriteria() {
    }

    public TransactionSearchCriteria(CategoryType type, Long categoryId, LocalDate startDate, LocalDate endDate, String keyword) {
        this.type = type;
        this.categoryId = categoryId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.keyword = keyword;
    }

    public CategoryType getType() {
        return type;
    }

    public void setType(CategoryType type) {
        this.type = type;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }
}
