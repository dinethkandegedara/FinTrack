package com.fintrack.dashboard.dto;

import com.fintrack.budget.dto.BudgetResponse;

import java.math.BigDecimal;
import java.util.List;

/**
 * Aggregated Financial Dashboard Summary response DTO.
 *
 * <p>Composes data across transactions, categories, and budgets for a given year and month.
 */
public class DashboardSummaryResponse {

    private int year;
    private int month;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal balance;
    private long transactionCount;
    private List<BudgetResponse> budgets;
    private List<CategorySpendingSummary> topExpenseCategories;

    public DashboardSummaryResponse() {
    }

    public DashboardSummaryResponse(
            int year,
            int month,
            BigDecimal totalIncome,
            BigDecimal totalExpense,
            BigDecimal balance,
            long transactionCount,
            List<BudgetResponse> budgets,
            List<CategorySpendingSummary> topExpenseCategories) {
        this.year = year;
        this.month = month;
        this.totalIncome = totalIncome;
        this.totalExpense = totalExpense;
        this.balance = balance;
        this.transactionCount = transactionCount;
        this.budgets = budgets;
        this.topExpenseCategories = topExpenseCategories;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public BigDecimal getTotalIncome() {
        return totalIncome;
    }

    public void setTotalIncome(BigDecimal totalIncome) {
        this.totalIncome = totalIncome;
    }

    public BigDecimal getTotalExpense() {
        return totalExpense;
    }

    public void setTotalExpense(BigDecimal totalExpense) {
        this.totalExpense = totalExpense;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public long getTransactionCount() {
        return transactionCount;
    }

    public void setTransactionCount(long transactionCount) {
        this.transactionCount = transactionCount;
    }

    public List<BudgetResponse> getBudgets() {
        return budgets;
    }

    public void setBudgets(List<BudgetResponse> budgets) {
        this.budgets = budgets;
    }

    public List<CategorySpendingSummary> getTopExpenseCategories() {
        return topExpenseCategories;
    }

    public void setTopExpenseCategories(List<CategorySpendingSummary> topExpenseCategories) {
        this.topExpenseCategories = topExpenseCategories;
    }

    /**
     * Category expense breakdown item.
     */
    public static class CategorySpendingSummary {
        private Long categoryId;
        private String categoryName;
        private BigDecimal totalAmount;
        private BigDecimal percentage;

        public CategorySpendingSummary() {
        }

        public CategorySpendingSummary(Long categoryId, String categoryName, BigDecimal totalAmount, BigDecimal percentage) {
            this.categoryId = categoryId;
            this.categoryName = categoryName;
            this.totalAmount = totalAmount;
            this.percentage = percentage;
        }

        public Long getCategoryId() {
            return categoryId;
        }

        public void setCategoryId(Long categoryId) {
            this.categoryId = categoryId;
        }

        public String getCategoryName() {
            return categoryName;
        }

        public void setCategoryName(String categoryName) {
            this.categoryName = categoryName;
        }

        public BigDecimal getTotalAmount() {
            return totalAmount;
        }

        public void setTotalAmount(BigDecimal totalAmount) {
            this.totalAmount = totalAmount;
        }

        public BigDecimal getPercentage() {
            return percentage;
        }

        public void setPercentage(BigDecimal percentage) {
            this.percentage = percentage;
        }
    }
}
