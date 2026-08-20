package com.fintrack.dashboard;

import com.fintrack.dashboard.dto.DashboardSummaryResponse;
import com.fintrack.security.SecurityUser;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller exposing aggregated dashboard summaries.
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * Retrieves aggregated monthly financial summary for the authenticated user.
     * Defaults to the current year and month if parameters are omitted.
     */
    @GetMapping
    public ResponseEntity<DashboardSummaryResponse> getMonthlyDashboard(
            @AuthenticationPrincipal SecurityUser currentUser,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {

        DashboardSummaryResponse response = dashboardService.getMonthlySummary(
                currentUser.getId(), year, month
        );
        return ResponseEntity.ok(response);
    }
}
