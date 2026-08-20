package com.fintrack.category;

import com.fintrack.common.BaseEntity;
import com.fintrack.user.User;
import jakarta.persistence.*;

/**
 * JPA Entity representing a spending or income Category in the `categories` table.
 *
 * <p>Architectural highlights:
 * <ul>
 *   <li><b>LAZY Fetching:</b> The {@code user} association uses {@code FetchType.LAZY} to avoid
 *       accidental eager loads and N+1 query surprises.</li>
 *   <li><b>Enum as String:</b> {@code @Enumerated(EnumType.STRING)} stores the descriptive name
 *       ('INCOME' or 'EXPENSE') rather than the fragile ordinal integer.</li>
 *   <li><b>Unidirectional:</b> No back-references to transactions or budgets are declared.</li>
 * </ul>
 */
@Entity
@Table(
        name = "categories",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_categories_user_name_type",
                        columnNames = {"user_id", "name", "type"}
                )
        }
)
public class Category extends BaseEntity {

    @Column(name = "name", nullable = false, length = 60)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 10)
    private CategoryType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Category() {
    }

    public Category(String name, CategoryType type, User user) {
        this.name = name;
        this.type = type;
        this.user = user;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public CategoryType getType() {
        return type;
    }

    public void setType(CategoryType type) {
        this.type = type;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
