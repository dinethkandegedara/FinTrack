package com.fintrack.transaction;

import com.fintrack.category.CategoryType;
import com.fintrack.transaction.dto.TransactionSearchCriteria;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * Specification builder class implementing dynamic query criteria for {@link Transaction} entities.
 *
 * <p>Constructs SQL {@code WHERE} clauses dynamically using the JPA Criteria API while guaranteeing
 * strict user data isolation.
 */
public class TransactionSpecifications {

    public static Specification<Transaction> withCriteria(Long userId, TransactionSearchCriteria criteria) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Non-negotiable security isolation: strictly filter by the authenticated user's ID
            predicates.add(criteriaBuilder.equal(root.get("user").get("id"), userId));

            if (criteria != null) {
                // Filter by category type (INCOME or EXPENSE)
                if (criteria.getType() != null) {
                    predicates.add(criteriaBuilder.equal(root.get("category").get("type"), criteria.getType()));
                }

                // Filter by specific category ID
                if (criteria.getCategoryId() != null) {
                    predicates.add(criteriaBuilder.equal(root.get("category").get("id"), criteria.getCategoryId()));
                }

                // Filter by start date (inclusive)
                if (criteria.getStartDate() != null) {
                    predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("transactionDate"), criteria.getStartDate()));
                }

                // Filter by end date (inclusive)
                if (criteria.getEndDate() != null) {
                    predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("transactionDate"), criteria.getEndDate()));
                }

                // Filter by keyword in description (case-insensitive substring match)
                if (StringUtils.hasText(criteria.getKeyword())) {
                    String pattern = "%" + criteria.getKeyword().trim().toLowerCase() + "%";
                    predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), pattern));
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
