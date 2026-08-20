package com.fintrack.transaction;

import com.fintrack.security.SecurityUser;
import com.fintrack.transaction.dto.TransactionRequest;
import com.fintrack.transaction.dto.TransactionResponse;
import com.fintrack.transaction.dto.TransactionSearchCriteria;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller exposing transaction management endpoints.
 */
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    /**
     * Retrieves a filtered, paginated list of transactions for the authenticated user.
     */
    @GetMapping
    public ResponseEntity<Page<TransactionResponse>> getTransactions(
            @AuthenticationPrincipal SecurityUser currentUser,
            @ModelAttribute TransactionSearchCriteria criteria,
            @PageableDefault(size = 10, sort = "transactionDate", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<TransactionResponse> transactions = transactionService.getTransactions(
                currentUser.getId(), criteria, pageable
        );
        return ResponseEntity.ok(transactions);
    }

    /**
     * Retrieves a single transaction by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransaction(
            @AuthenticationPrincipal SecurityUser currentUser,
            @PathVariable Long id) {

        TransactionResponse transaction = transactionService.getTransaction(id, currentUser.getId());
        return ResponseEntity.ok(transaction);
    }

    /**
     * Records a new transaction.
     */
    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @AuthenticationPrincipal SecurityUser currentUser,
            @Valid @RequestBody TransactionRequest request) {

        TransactionResponse created = transactionService.createTransaction(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Updates an existing transaction.
     */
    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> updateTransaction(
            @AuthenticationPrincipal SecurityUser currentUser,
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request) {

        TransactionResponse updated = transactionService.updateTransaction(id, currentUser.getId(), request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Deletes a transaction.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @AuthenticationPrincipal SecurityUser currentUser,
            @PathVariable Long id) {

        transactionService.deleteTransaction(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
