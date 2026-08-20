package com.fintrack.category;

import com.fintrack.category.dto.CategoryRequest;
import com.fintrack.category.dto.CategoryResponse;
import com.fintrack.exception.DuplicateResourceException;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.user.User;
import com.fintrack.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service managing business rules and data operations for {@link Category} entities.
 *
 * <p>Enforces strict per-user data isolation on every read and write operation.
 */
@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserService userService;
    private final CategoryMapper categoryMapper;

    public CategoryService(
            CategoryRepository categoryRepository,
            UserService userService,
            CategoryMapper categoryMapper) {
        this.categoryRepository = categoryRepository;
        this.userService = userService;
        this.categoryMapper = categoryMapper;
    }

    /**
     * Retrieves all categories for the authenticated user, optionally filtered by {@link CategoryType}.
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories(Long userId, CategoryType type) {
        List<Category> categories;
        if (type != null) {
            categories = categoryRepository.findByUserIdAndTypeOrderByNameAsc(userId, type);
        } else {
            categories = categoryRepository.findByUserIdOrderByNameAsc(userId);
        }

        return categories.stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a single category by ID, verifying user ownership.
     */
    @Transactional(readOnly = true)
    public CategoryResponse getCategory(Long id, Long userId) {
        Category category = findCategoryEntity(id, userId);
        return categoryMapper.toResponse(category);
    }

    /**
     * Creates a new category for the authenticated user after validating uniqueness.
     */
    @Transactional
    public CategoryResponse createCategory(Long userId, CategoryRequest request) {
        String trimmedName = request.getName().trim();

        if (categoryRepository.existsByUserIdAndNameIgnoreCaseAndType(userId, trimmedName, request.getType())) {
            throw new DuplicateResourceException(
                    String.format("A category named '%s' of type '%s' already exists", trimmedName, request.getType())
            );
        }

        User user = userService.findUserById(userId);
        Category category = new Category(trimmedName, request.getType(), user);
        Category saved = categoryRepository.save(category);

        return categoryMapper.toResponse(saved);
    }

    /**
     * Updates/renames an existing category. The category type remains immutable.
     */
    @Transactional
    public CategoryResponse updateCategory(Long id, Long userId, CategoryRequest request) {
        Category category = findCategoryEntity(id, userId);
        String trimmedName = request.getName().trim();

        if (categoryRepository.existsByUserIdAndNameIgnoreCaseAndTypeAndIdNot(userId, trimmedName, category.getType(), id)) {
            throw new DuplicateResourceException(
                    String.format("A category named '%s' of type '%s' already exists", trimmedName, category.getType())
            );
        }

        category.setName(trimmedName);
        Category updated = categoryRepository.save(category);

        return categoryMapper.toResponse(updated);
    }

    /**
     * Deletes a category owned by the user.
     */
    @Transactional
    public void deleteCategory(Long id, Long userId) {
        Category category = findCategoryEntity(id, userId);
        categoryRepository.delete(category);
    }

    /**
     * Helper to find a Category JPA entity or throw {@link ResourceNotFoundException}.
     */
    @Transactional(readOnly = true)
    public Category findCategoryEntity(Long id, Long userId) {
        return categoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }
}
