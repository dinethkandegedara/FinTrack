package com.fintrack.budget;

import com.fintrack.budget.dto.BudgetRequest;
import com.fintrack.budget.dto.BudgetResponse;
import com.fintrack.security.SecurityUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller exposing budget management endpoints.
 */
@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    /**
     * Retrieves all budgets for a given year and month.
     */
    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getBudgets(
            @AuthenticationPrincipal SecurityUser currentUser,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {

        List<BudgetResponse> budgets = budgetService.getBudgets(currentUser.getId(), year, month);
        return ResponseEntity.ok(budgets);
    }

    /**
     * Retrieves a single budget by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<BudgetResponse> getBudget(
            @AuthenticationPrincipal SecurityUser currentUser,
            @PathVariable Long id) {

        BudgetResponse budget = budgetService.getBudget(id, currentUser.getId());
        return ResponseEntity.ok(budget);
    }

    /**
     * Creates a new monthly category budget.
     */
    @PostMapping
    public ResponseEntity<BudgetResponse> createBudget(
            @AuthenticationPrincipal SecurityUser currentUser,
            @Valid @RequestBody BudgetRequest request) {

        BudgetResponse created = budgetService.createBudget(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Updates an existing budget amount.
     */
    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponse> updateBudget(
            @AuthenticationPrincipal SecurityUser currentUser,
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequest request) {

        BudgetResponse updated = budgetService.updateBudget(id, currentUser.getId(), request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Deletes a budget.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(
            @AuthenticationPrincipal SecurityUser currentUser,
            @PathVariable Long id) {

        budgetService.deleteBudget(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
