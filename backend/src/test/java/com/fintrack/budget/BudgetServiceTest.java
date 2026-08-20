package com.fintrack.budget;

import com.fintrack.budget.dto.BudgetRequest;
import com.fintrack.budget.dto.BudgetResponse;
import com.fintrack.category.Category;
import com.fintrack.category.CategoryService;
import com.fintrack.category.CategoryType;
import com.fintrack.category.dto.CategoryResponse;
import com.fintrack.exception.BadRequestException;
import com.fintrack.exception.DuplicateResourceException;
import com.fintrack.transaction.TransactionRepository;
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
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserService userService;

    @Mock
    private CategoryService categoryService;

    @Mock
    private BudgetMapper budgetMapper;

    @InjectMocks
    private BudgetService budgetService;

    private User sampleUser;
    private Category expenseCategory;
    private Category incomeCategory;
    private Budget sampleBudget;

    @BeforeEach
    void setUp() {
        sampleUser = new User("Alice Walker", "alice@example.com", "hash");
        sampleUser.setId(1L);

        expenseCategory = new Category("Groceries", CategoryType.EXPENSE, sampleUser);
        expenseCategory.setId(10L);

        incomeCategory = new Category("Salary", CategoryType.INCOME, sampleUser);
        incomeCategory.setId(20L);

        sampleBudget = new Budget(2026, 8, new BigDecimal("400.00"), sampleUser, expenseCategory);
        sampleBudget.setId(100L);
        sampleBudget.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should successfully create a budget for an EXPENSE category with computed spent metrics")
    void createBudget_Success() {
        BudgetRequest request = new BudgetRequest(10L, 2026, 8, new BigDecimal("400.00"));
        CategoryResponse categoryResponse = new CategoryResponse(10L, "Groceries", CategoryType.EXPENSE, LocalDateTime.now());
        BudgetResponse response = new BudgetResponse(
                100L,
                categoryResponse,
                2026,
                8,
                new BigDecimal("400.00"),
                new BigDecimal("100.00"),
                new BigDecimal("300.00"),
                new BigDecimal("25.00"),
                sampleBudget.getCreatedAt()
        );

        when(categoryService.findCategoryEntity(10L, 1L)).thenReturn(expenseCategory);
        when(budgetRepository.existsByUserIdAndCategoryIdAndBudgetYearAndBudgetMonth(1L, 10L, 2026, 8)).thenReturn(false);
        when(userService.findUserById(1L)).thenReturn(sampleUser);
        when(budgetRepository.save(any(Budget.class))).thenReturn(sampleBudget);
        when(transactionRepository.sumAmountByUserIdAndCategoryIdAndDateRange(
                eq(1L), eq(10L), any(LocalDate.class), any(LocalDate.class)
        )).thenReturn(new BigDecimal("100.00"));
        when(budgetMapper.toResponse(eq(sampleBudget), eq(new BigDecimal("100.00")))).thenReturn(response);

        BudgetResponse result = budgetService.createBudget(1L, request);

        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualByComparingTo("400.00");
        assertThat(result.getSpent()).isEqualByComparingTo("100.00");
        assertThat(result.getRemaining()).isEqualByComparingTo("300.00");
        assertThat(result.getPercentUsed()).isEqualByComparingTo("25.00");
    }

    @Test
    @DisplayName("Should reject budget creation on an INCOME category with BadRequestException")
    void createBudget_IncomeCategory_ThrowsException() {
        BudgetRequest request = new BudgetRequest(20L, 2026, 8, new BigDecimal("400.00"));

        when(categoryService.findCategoryEntity(20L, 1L)).thenReturn(incomeCategory);

        assertThatThrownBy(() -> budgetService.createBudget(1L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("EXPENSE categories");

        verify(budgetRepository, never()).save(any(Budget.class));
    }

    @Test
    @DisplayName("Should reject duplicate budget for the same month and category with DuplicateResourceException")
    void createBudget_DuplicateMonth_ThrowsException() {
        BudgetRequest request = new BudgetRequest(10L, 2026, 8, new BigDecimal("400.00"));

        when(categoryService.findCategoryEntity(10L, 1L)).thenReturn(expenseCategory);
        when(budgetRepository.existsByUserIdAndCategoryIdAndBudgetYearAndBudgetMonth(1L, 10L, 2026, 8)).thenReturn(true);

        assertThatThrownBy(() -> budgetService.createBudget(1L, request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already exists");
    }
}
