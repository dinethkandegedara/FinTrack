package com.fintrack.transaction;

import com.fintrack.category.Category;
import com.fintrack.category.CategoryService;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.transaction.dto.TransactionRequest;
import com.fintrack.transaction.dto.TransactionResponse;
import com.fintrack.transaction.dto.TransactionSearchCriteria;
import com.fintrack.user.User;
import com.fintrack.user.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service managing financial transactions, filtering, and data integrity.
 */
@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserService userService;
    private final CategoryService categoryService;
    private final TransactionMapper transactionMapper;

    public TransactionService(
            TransactionRepository transactionRepository,
            UserService userService,
            CategoryService categoryService,
            TransactionMapper transactionMapper) {
        this.transactionRepository = transactionRepository;
        this.userService = userService;
        this.categoryService = categoryService;
        this.transactionMapper = transactionMapper;
    }

    /**
     * Retrieves a paginated list of transactions matching dynamic search and filter criteria.
     */
    @Transactional(readOnly = true)
    public Page<TransactionResponse> getTransactions(Long userId, TransactionSearchCriteria criteria, Pageable pageable) {
        Specification<Transaction> spec = TransactionSpecifications.withCriteria(userId, criteria);
        Page<Transaction> page = transactionRepository.findAll(spec, pageable);
        return page.map(transactionMapper::toResponse);
    }

    /**
     * Retrieves a single transaction by ID, strictly verifying ownership.
     */
    @Transactional(readOnly = true)
    public TransactionResponse getTransaction(Long id, Long userId) {
        Transaction transaction = findTransactionEntity(id, userId);
        return transactionMapper.toResponse(transaction);
    }

    /**
     * Records a new transaction after validating that the category belongs to the authenticated user.
     */
    @Transactional
    public TransactionResponse createTransaction(Long userId, TransactionRequest request) {
        User user = userService.findUserById(userId);
        Category category = categoryService.findCategoryEntity(request.getCategoryId(), userId);

        Transaction transaction = new Transaction(
                request.getAmount(),
                request.getTransactionDate(),
                request.getDescription() != null ? request.getDescription().trim() : null,
                user,
                category
        );

        Transaction saved = transactionRepository.save(transaction);
        return transactionMapper.toResponse(saved);
    }

    /**
     * Updates an existing transaction.
     */
    @Transactional
    public TransactionResponse updateTransaction(Long id, Long userId, TransactionRequest request) {
        Transaction transaction = findTransactionEntity(id, userId);
        Category category = categoryService.findCategoryEntity(request.getCategoryId(), userId);

        transaction.setAmount(request.getAmount());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        transaction.setCategory(category);

        Transaction updated = transactionRepository.save(transaction);
        return transactionMapper.toResponse(updated);
    }

    /**
     * Deletes a transaction owned by the user.
     */
    @Transactional
    public void deleteTransaction(Long id, Long userId) {
        Transaction transaction = findTransactionEntity(id, userId);
        transactionRepository.delete(transaction);
    }

    /**
     * Internal helper to find a Transaction entity or throw {@link ResourceNotFoundException}.
     */
    @Transactional(readOnly = true)
    public Transaction findTransactionEntity(Long id, Long userId) {
        return transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
    }
}
