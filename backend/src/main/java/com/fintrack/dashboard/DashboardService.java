package com.fintrack.dashboard;

import com.fintrack.budget.BudgetService;
import com.fintrack.budget.dto.BudgetResponse;
import com.fintrack.category.CategoryType;
import com.fintrack.dashboard.dto.DashboardSummaryResponse;
import com.fintrack.dashboard.dto.DashboardSummaryResponse.CategorySpendingSummary;
import com.fintrack.transaction.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service composing monthly financial summaries across transactions and budgets.
 *
 * <p>Architectural note: This service owns no entity or database table of its own; it orchestrates
 * multi-feature data retrieval into a single read-optimized summary.
 */
@Service
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final BudgetService budgetService;

    public DashboardService(TransactionRepository transactionRepository, BudgetService budgetService) {
        this.transactionRepository = transactionRepository;
        this.budgetService = budgetService;
    }

    /**
     * Aggregates financial performance metrics for the given user, year, and month.
     */
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getMonthlySummary(Long userId, Integer year, Integer month) {
        LocalDate now = LocalDate.now();
        int targetYear = year != null ? year : now.getYear();
        int targetMonth = month != null ? month : now.getMonthValue();

        YearMonth ym = YearMonth.of(targetYear, targetMonth);
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        // 1. Calculate Total Income for the month
        BigDecimal totalIncome = transactionRepository.sumAmountByUserIdAndCategoryTypeAndDateRange(
                userId, CategoryType.INCOME, startDate, endDate
        );
        if (totalIncome == null) {
            totalIncome = BigDecimal.ZERO;
        }

        // 2. Calculate Total Expense for the month
        BigDecimal totalExpense = transactionRepository.sumAmountByUserIdAndCategoryTypeAndDateRange(
                userId, CategoryType.EXPENSE, startDate, endDate
        );
        if (totalExpense == null) {
            totalExpense = BigDecimal.ZERO;
        }

        // 3. Compute Net Balance (Income - Expense)
        BigDecimal balance = totalIncome.subtract(totalExpense);

        // 4. Count total transactions in this period
        long transactionCount = transactionRepository.countByUserIdAndDateRange(userId, startDate, endDate);

        // 5. Fetch all Category Budgets and live spending for this month
        List<BudgetResponse> budgets = budgetService.getBudgets(userId, targetYear, targetMonth);

        // 6. Aggregate Expense Breakdown by Category
        BigDecimal finalTotalExpense = totalExpense;
        List<CategorySpendingSummary> topExpenseCategories = transactionRepository
                .findTopExpenseCategories(userId, startDate, endDate)
                .stream()
                .map(projection -> {
                    BigDecimal catAmount = projection.getTotalAmount() != null ? projection.getTotalAmount() : BigDecimal.ZERO;
                    BigDecimal percentage = BigDecimal.ZERO;

                    if (finalTotalExpense.compareTo(BigDecimal.ZERO) > 0) {
                        percentage = catAmount
                                .multiply(BigDecimal.valueOf(100))
                                .divide(finalTotalExpense, 2, RoundingMode.HALF_UP);
                    }

                    return new CategorySpendingSummary(
                            projection.getCategoryId(),
                            projection.getCategoryName(),
                            catAmount,
                            percentage
                    );
                })
                .collect(Collectors.toList());

        return new DashboardSummaryResponse(
                targetYear,
                targetMonth,
                totalIncome,
                totalExpense,
                balance,
                transactionCount,
                budgets,
                topExpenseCategories
        );
    }
}
