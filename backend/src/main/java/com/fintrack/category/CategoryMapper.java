package com.fintrack.category;

import com.fintrack.category.dto.CategoryResponse;
import org.springframework.stereotype.Component;

/**
 * Mapper component converting between {@link Category} JPA entities and {@link CategoryResponse} DTOs.
 *
 * <p>Explicit handwritten mappers eliminate reflection overhead and third-party magic, ensuring
 * clear and debuggable transformation logic.
 */
@Component
public class CategoryMapper {

    public CategoryResponse toResponse(Category category) {
        if (category == null) {
            return null;
        }

        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getType(),
                category.getCreatedAt()
        );
    }
}
