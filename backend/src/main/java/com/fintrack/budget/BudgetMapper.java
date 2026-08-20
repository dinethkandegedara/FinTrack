package com.fintrack.budget;

import com.fintrack.budget.dto.BudgetResponse;
import com.fintrack.category.CategoryMapper;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Mapper component converting between {@link Budget} JPA entities and enriched {@link BudgetResponse} DTOs.
 */
@Component
public class BudgetMapper {

    private final CategoryMapper categoryMapper;

    public BudgetMapper(CategoryMapper categoryMapper) {
        this.categoryMapper = categoryMapper;
    }

    public BudgetResponse toResponse(Budget budget, BigDecimal spent) {
        if (budget == null) {
            return null;
        }

        BigDecimal actualSpent = spent != null ? spent : BigDecimal.ZERO;
        BigDecimal budgetedAmount = budget.getAmount();
        BigDecimal remaining = budgetedAmount.subtract(actualSpent);

        BigDecimal percentUsed = BigDecimal.ZERO;
        if (budgetedAmount.compareTo(BigDecimal.ZERO) > 0) {
            percentUsed = actualSpent
                    .multiply(BigDecimal.valueOf(100))
                    .divide(budgetedAmount, 2, RoundingMode.HALF_UP);
        }

        return new BudgetResponse(
                budget.getId(),
                categoryMapper.toResponse(budget.getCategory()),
                budget.getBudgetYear(),
                budget.getBudgetMonth(),
                budgetedAmount,
                actualSpent,
                remaining,
                percentUsed,
                budget.getCreatedAt()
        );
    }
}
