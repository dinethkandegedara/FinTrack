package com.fintrack.transaction;

import com.fintrack.category.CategoryMapper;
import com.fintrack.transaction.dto.TransactionResponse;
import org.springframework.stereotype.Component;

/**
 * Mapper component converting between {@link Transaction} JPA entities and {@link TransactionResponse} DTOs.
 */
@Component
public class TransactionMapper {

    private final CategoryMapper categoryMapper;

    public TransactionMapper(CategoryMapper categoryMapper) {
        this.categoryMapper = categoryMapper;
    }

    public TransactionResponse toResponse(Transaction transaction) {
        if (transaction == null) {
            return null;
        }

        return new TransactionResponse(
                transaction.getId(),
                transaction.getAmount(),
                transaction.getTransactionDate(),
                transaction.getDescription(),
                categoryMapper.toResponse(transaction.getCategory()),
                transaction.getCategory() != null ? transaction.getCategory().getType() : null,
                transaction.getCreatedAt(),
                transaction.getUpdatedAt()
        );
    }
}
