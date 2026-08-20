package com.fintrack.transaction;

import com.fintrack.category.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository interface for {@link Transaction} entities.
 *
 * <p>Extends {@link JpaSpecificationExecutor} to enable dynamic Specification-based filtering.
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {

    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    boolean existsByCategoryIdAndUserId(Long categoryId, Long userId);

    /**
     * Aggregates total amount for a given user, category type (INCOME or EXPENSE), and date range.
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId " +
           "AND t.category.type = :type " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal sumAmountByUserIdAndCategoryTypeAndDateRange(
            @Param("userId") Long userId,
            @Param("type") CategoryType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * Aggregates total spending for a specific category and date range (used for budget-vs-actual calculation).
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId " +
           "AND t.category.id = :categoryId " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal sumAmountByUserIdAndCategoryIdAndDateRange(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * Counts the total number of transactions recorded by the user within a date range.
     */
    @Query("SELECT COUNT(t) FROM Transaction t " +
           "WHERE t.user.id = :userId " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate")
    long countByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * Category spending summary projection for top expense breakdown in dashboard.
     */
    @Query("SELECT t.category.id AS categoryId, t.category.name AS categoryName, SUM(t.amount) AS totalAmount " +
           "FROM Transaction t " +
           "WHERE t.user.id = :userId " +
           "AND t.category.type = 'EXPENSE' " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "GROUP BY t.category.id, t.category.name " +
           "ORDER BY totalAmount DESC")
    List<CategorySpendingProjection> findTopExpenseCategories(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * Spring Data JPA Projection interface for category spending aggregation.
     */
    interface CategorySpendingProjection {
        Long getCategoryId();
        String getCategoryName();
        BigDecimal getTotalAmount();
    }
}
