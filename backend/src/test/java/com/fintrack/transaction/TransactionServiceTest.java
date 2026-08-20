package com.fintrack.transaction;

import com.fintrack.category.Category;
import com.fintrack.category.CategoryService;
import com.fintrack.category.CategoryType;
import com.fintrack.category.dto.CategoryResponse;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.transaction.dto.TransactionRequest;
import com.fintrack.transaction.dto.TransactionResponse;
import com.fintrack.user.User;
import com.fintrack.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserService userService;

    @Mock
    private CategoryService categoryService;

    @Mock
    private TransactionMapper transactionMapper;

    @InjectMocks
    private TransactionService transactionService;

    private User sampleUser;
    private Category sampleCategory;
    private Transaction sampleTransaction;

    @BeforeEach
    void setUp() {
        sampleUser = new User("Alice Walker", "alice@example.com", "hash");
        sampleUser.setId(1L);

        sampleCategory = new Category("Groceries", CategoryType.EXPENSE, sampleUser);
        sampleCategory.setId(10L);

        sampleTransaction = new Transaction(
                new BigDecimal("45.20"),
                LocalDate.of(2026, 8, 20),
                "Weekly grocery shopping",
                sampleUser,
                sampleCategory
        );
        sampleTransaction.setId(100L);
        sampleTransaction.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should successfully record a transaction when category belongs to the user")
    void createTransaction_Success() {
        TransactionRequest request = new TransactionRequest(
                10L,
                new BigDecimal("45.20"),
                LocalDate.of(2026, 8, 20),
                "Weekly grocery shopping"
        );

        CategoryResponse categoryResponse = new CategoryResponse(10L, "Groceries", CategoryType.EXPENSE, LocalDateTime.now());
        TransactionResponse response = new TransactionResponse(
                100L,
                new BigDecimal("45.20"),
                LocalDate.of(2026, 8, 20),
                "Weekly grocery shopping",
                categoryResponse,
                CategoryType.EXPENSE,
                sampleTransaction.getCreatedAt(),
                null
        );

        when(userService.findUserById(1L)).thenReturn(sampleUser);
        when(categoryService.findCategoryEntity(10L, 1L)).thenReturn(sampleCategory);
        when(transactionRepository.save(any(Transaction.class))).thenReturn(sampleTransaction);
        when(transactionMapper.toResponse(sampleTransaction)).thenReturn(response);

        TransactionResponse result = transactionService.createTransaction(1L, request);

        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualByComparingTo("45.20");
        assertThat(result.getDescription()).isEqualTo("Weekly grocery shopping");
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when category does not belong to user")
    void createTransaction_UnauthorizedCategory_ThrowsException() {
        TransactionRequest request = new TransactionRequest(
                99L,
                new BigDecimal("45.20"),
                LocalDate.of(2026, 8, 20),
                "Weekly grocery shopping"
        );

        when(userService.findUserById(1L)).thenReturn(sampleUser);
        when(categoryService.findCategoryEntity(99L, 1L)).thenThrow(new ResourceNotFoundException("Category not found"));

        assertThatThrownBy(() -> transactionService.createTransaction(1L, request))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(transactionRepository, never()).save(any(Transaction.class));
    }
}
