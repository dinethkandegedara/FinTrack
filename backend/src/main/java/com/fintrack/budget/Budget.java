package com.fintrack.budget;

import com.fintrack.category.Category;
import com.fintrack.common.BaseEntity;
import com.fintrack.user.User;
import jakarta.persistence.*;

import java.math.BigDecimal;

/**
 * JPA Entity representing a Monthly Category Budget in the `budgets` table.
 *
 * <p>Architectural highlights:
 * <ul>
 *   <li><b>Unique Constraint:</b> Enforces exactly one budget per user per category per year and month at database level.</li>
 *   <li><b>LAZY Fetching:</b> Unidirectional many-to-one links to {@link User} and {@link Category}.</li>
 *   <li><b>Year &amp; Month as Integers:</b> Avoids synthetic "1st of the month" date manipulation.</li>
 * </ul>
 */
@Entity
@Table(
        name = "budgets",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_budgets_user_category_year_month",
                        columnNames = {"user_id", "category_id", "budget_year", "budget_month"}
                )
        }
)
public class Budget extends BaseEntity {

    @Column(name = "budget_year", nullable = false)
    private Integer budgetYear;

    @Column(name = "budget_month", nullable = false)
    private Integer budgetMonth;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    public Budget() {
    }

    public Budget(Integer budgetYear, Integer budgetMonth, BigDecimal amount, User user, Category category) {
        this.budgetYear = budgetYear;
        this.budgetMonth = budgetMonth;
        this.amount = amount;
        this.user = user;
        this.category = category;
    }

    public Integer getBudgetYear() {
        return budgetYear;
    }

    public void setBudgetYear(Integer budgetYear) {
        this.budgetYear = budgetYear;
    }

    public Integer getBudgetMonth() {
        return budgetMonth;
    }

    public void setBudgetMonth(Integer budgetMonth) {
        this.budgetMonth = budgetMonth;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }
}
