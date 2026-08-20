package com.fintrack.transaction;

import com.fintrack.category.Category;
import com.fintrack.common.BaseEntity;
import com.fintrack.user.User;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * JPA Entity representing a financial Transaction in the `transactions` table.
 *
 * <p>Architectural decisions:
 * <ul>
 *   <li><b>Exact Decimal Precision:</b> Uses {@link BigDecimal} with {@code precision = 12, scale = 2}
 *       and Postgres {@code NUMERIC(12,2)} to completely avoid binary floating-point rounding errors.</li>
 *   <li><b>Explicit LAZY Fetch:</b> Both {@code user} and {@code category} associations explicitly declare
 *       {@code fetch = FetchType.LAZY} to prevent unneeded eager queries.</li>
 *   <li><b>Derived Nature:</b> No redundant {@code type} column is stored on the transaction;
 *       the income/expense classification is derived exclusively from {@code category.getType()}.</li>
 *   <li><b>Composite Indexing:</b> Indexed on {@code (user_id, transaction_date)} to optimize filtering and dashboard aggregations.</li>
 * </ul>
 */
@Entity
@Table(
        name = "transactions",
        indexes = {
                @Index(name = "idx_transactions_user_date", columnList = "user_id, transaction_date")
        }
)
public class Transaction extends BaseEntity {

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Column(name = "description", length = 255)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    public Transaction() {
    }

    public Transaction(BigDecimal amount, LocalDate transactionDate, String description, User user, Category category) {
        this.amount = amount;
        this.transactionDate = transactionDate;
        this.description = description;
        this.user = user;
        this.category = category;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDate transactionDate) {
        this.transactionDate = transactionDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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
