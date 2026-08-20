package com.fintrack.category.dto;

import com.fintrack.category.CategoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO for creating or renaming a category.
 */
public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    @Size(min = 1, max = 60, message = "Category name must be between 1 and 60 characters")
    private String name;

    @NotNull(message = "Category type (INCOME or EXPENSE) is required")
    private CategoryType type;

    public CategoryRequest() {
    }

    public CategoryRequest(String name, CategoryType type) {
        this.name = name;
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public CategoryType getType() {
        return type;
    }

    public void setType(CategoryType type) {
        this.type = type;
    }
}
