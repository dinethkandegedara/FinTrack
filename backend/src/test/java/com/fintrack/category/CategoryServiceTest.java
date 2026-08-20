package com.fintrack.category;

import com.fintrack.category.dto.CategoryRequest;
import com.fintrack.category.dto.CategoryResponse;
import com.fintrack.exception.DuplicateResourceException;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.user.User;
import com.fintrack.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserService userService;

    @Mock
    private CategoryMapper categoryMapper;

    @InjectMocks
    private CategoryService categoryService;

    private User sampleUser;
    private Category sampleCategory;

    @BeforeEach
    void setUp() {
        sampleUser = new User("Alice Walker", "alice@example.com", "hash");
        sampleUser.setId(1L);

        sampleCategory = new Category("Groceries", CategoryType.EXPENSE, sampleUser);
        sampleCategory.setId(10L);
        sampleCategory.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should create a category when name is unique for user and type")
    void createCategory_Success() {
        CategoryRequest request = new CategoryRequest("Groceries", CategoryType.EXPENSE);
        CategoryResponse response = new CategoryResponse(10L, "Groceries", CategoryType.EXPENSE, sampleCategory.getCreatedAt());

        when(categoryRepository.existsByUserIdAndNameIgnoreCaseAndType(1L, "Groceries", CategoryType.EXPENSE)).thenReturn(false);
        when(userService.findUserById(1L)).thenReturn(sampleUser);
        when(categoryRepository.save(any(Category.class))).thenReturn(sampleCategory);
        when(categoryMapper.toResponse(sampleCategory)).thenReturn(response);

        CategoryResponse result = categoryService.createCategory(1L, request);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Groceries");
        assertThat(result.getType()).isEqualTo(CategoryType.EXPENSE);
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when category name and type collide")
    void createCategory_Duplicate_ThrowsException() {
        CategoryRequest request = new CategoryRequest("Groceries", CategoryType.EXPENSE);

        when(categoryRepository.existsByUserIdAndNameIgnoreCaseAndType(1L, "Groceries", CategoryType.EXPENSE)).thenReturn(true);

        assertThatThrownBy(() -> categoryService.createCategory(1L, request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when category not found or not owned")
    void getCategory_NotFound_ThrowsException() {
        when(categoryRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.getCategory(99L, 1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
