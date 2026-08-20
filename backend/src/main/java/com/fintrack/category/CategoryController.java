package com.fintrack.category;

import com.fintrack.category.dto.CategoryRequest;
import com.fintrack.category.dto.CategoryResponse;
import com.fintrack.security.SecurityUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller managing category resources.
 */
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    /**
     * Lists categories belonging to the current user, optionally filtered by type.
     */
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getCategories(
            @AuthenticationPrincipal SecurityUser currentUser,
            @RequestParam(required = false) CategoryType type) {

        List<CategoryResponse> categories = categoryService.getCategories(currentUser.getId(), type);
        return ResponseEntity.ok(categories);
    }

    /**
     * Retrieves a single category by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategory(
            @AuthenticationPrincipal SecurityUser currentUser,
            @PathVariable Long id) {

        CategoryResponse category = categoryService.getCategory(id, currentUser.getId());
        return ResponseEntity.ok(category);
    }

    /**
     * Creates a new category for the authenticated user.
     */
    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @AuthenticationPrincipal SecurityUser currentUser,
            @Valid @RequestBody CategoryRequest request) {

        CategoryResponse created = categoryService.createCategory(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Updates an existing category's name.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @AuthenticationPrincipal SecurityUser currentUser,
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {

        CategoryResponse updated = categoryService.updateCategory(id, currentUser.getId(), request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Deletes an existing category.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            @AuthenticationPrincipal SecurityUser currentUser,
            @PathVariable Long id) {

        categoryService.deleteCategory(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
