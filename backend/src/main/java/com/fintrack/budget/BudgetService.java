package com.fintrack.budget;

import com.fintrack.budget.dto.BudgetRequest;
import com.fintrack.budget.dto.BudgetResponse;
import com.fintrack.category.Category;
import com.fintrack.category.CategoryService;
import com.fintrack.category.CategoryType;
import com.fintrack.exception.BadRequestException;
import com.fintrack.exception.DuplicateResourceException;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.transaction.TransactionRepository;
import com.fintrack.user.User;
import com.fintrack.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service managing monthly budget definitions and live budget-vs-actual aggregations.
 */
@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final UserService userService;
    private final CategoryService categoryService;
    private final BudgetMapper budgetMapper;

    public BudgetService(
            BudgetRepository budgetRepository,
            TransactionRepository transactionRepository,
            UserService userService,
            CategoryService categoryService,
            BudgetMapper budgetMapper) {
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
        this.userService = userService;
        this.categoryService = categoryService;
        this.budgetMapper = budgetMapper;
    }

    /**
     * Retrieves all budgets for a given year and month, enriched with server-computed live spending.
     */
    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgets(Long userId, Integer year, Integer month) {
        LocalDate now = LocalDate.now();
        int budgetYear = year != null ? year : now.getYear();
        int budgetMonth = month != null ? month : now.getMonthValue();

        List<Budget> budgets = budgetRepository.findByUserIdAndBudgetYearAndBudgetMonthOrderByCategoryNameAsc(
                userId, budgetYear, budgetMonth
        );

        YearMonth ym = YearMonth.of(budgetYear, budgetMonth);
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        return budgets.stream()
                .map(budget -> {
                    BigDecimal spent = transactionRepository.sumAmountByUserIdAndCategoryIdAndDateRange(
                            userId, budget.getCategory().getId(), startDate, endDate
                    );
                    return budgetMapper.toResponse(budget, spent);
                })
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a single budget by ID with computed metrics.
     */
    @Transactional(readOnly = true)
    public BudgetResponse getBudget(Long id, Long userId) {
        Budget budget = findBudgetEntity(id, userId);

        YearMonth ym = YearMonth.of(budget.getBudgetYear(), budget.getBudgetMonth());
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        BigDecimal spent = transactionRepository.sumAmountByUserIdAndCategoryIdAndDateRange(
                userId, budget.getCategory().getId(), startDate, endDate
        );

        return budgetMapper.toResponse(budget, spent);
    }

    /**
     * Creates a new monthly budget after verifying ownership, expense type, and uniqueness.
     */
    @Transactional
    public BudgetResponse createBudget(Long userId, BudgetRequest request) {
        Category category = categoryService.findCategoryEntity(request.getCategoryId(), userId);

        // Business Rule: Budgets can only be created for EXPENSE categories
        if (category.getType() != CategoryType.EXPENSE) {
            throw new BadRequestException("Budgets can only be assigned to EXPENSE categories");
        }

        // Business Rule: One budget per category per month
        if (budgetRepository.existsByUserIdAndCategoryIdAndBudgetYearAndBudgetMonth(
                userId, request.getCategoryId(), request.getBudgetYear(), request.getBudgetMonth())) {
            throw new DuplicateResourceException(
                    String.format("A budget already exists for category '%s' in %d-%02d",
                            category.getName(), request.getBudgetYear(), request.getBudgetMonth())
            );
        }

        User user = userService.findUserById(userId);
        Budget budget = new Budget(
                request.getBudgetYear(),
                request.getBudgetMonth(),
                request.getAmount(),
                user,
                category
        );

        Budget saved = budgetRepository.save(budget);

        YearMonth ym = YearMonth.of(request.getBudgetYear(), request.getBudgetMonth());
        BigDecimal spent = transactionRepository.sumAmountByUserIdAndCategoryIdAndDateRange(
                userId, category.getId(), ym.atDay(1), ym.atEndOfMonth()
        );

        return budgetMapper.toResponse(saved, spent);
    }

    /**
     * Updates the budgeted amount.
     */
    @Transactional
    public BudgetResponse updateBudget(Long id, Long userId, BudgetRequest request) {
        Budget budget = findBudgetEntity(id, userId);
        budget.setAmount(request.getAmount());

        Budget updated = budgetRepository.save(budget);

        YearMonth ym = YearMonth.of(updated.getBudgetYear(), updated.getBudgetMonth());
        BigDecimal spent = transactionRepository.sumAmountByUserIdAndCategoryIdAndDateRange(
                userId, updated.getCategory().getId(), ym.atDay(1), ym.atEndOfMonth()
        );

        return budgetMapper.toResponse(updated, spent);
    }

    /**
     * Deletes a budget.
     */
    @Transactional
    public void deleteBudget(Long id, Long userId) {
        Budget budget = findBudgetEntity(id, userId);
        budgetRepository.delete(budget);
    }

    /**
     * Helper to retrieve a Budget entity or throw {@link ResourceNotFoundException}.
     */
    @Transactional(readOnly = true)
    public Budget findBudgetEntity(Long id, Long userId) {
        return budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + id));
    }
}
