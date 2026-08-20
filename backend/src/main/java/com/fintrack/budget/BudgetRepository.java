package com.fintrack.budget;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository interface for {@link Budget} entities.
 */
@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUserIdAndBudgetYearAndBudgetMonthOrderByCategoryNameAsc(Long userId, Integer budgetYear, Integer budgetMonth);

    Optional<Budget> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndCategoryIdAndBudgetYearAndBudgetMonth(Long userId, Long categoryId, Integer budgetYear, Integer budgetMonth);

    boolean existsByCategoryIdAndUserId(Long categoryId, Long userId);
}
