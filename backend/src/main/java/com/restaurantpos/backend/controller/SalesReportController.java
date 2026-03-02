package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.service.SalesReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:4200")
public class SalesReportController {

    @Autowired
    private SalesReportService salesReportService;

    @GetMapping("/summary")
    public SalesReportService.SalesSummary getSalesSummary() {
        return salesReportService.getSalesSummary();
    }

    @GetMapping("/revenue")
    public ResponseEntity<BigDecimal> getRevenueBetween(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(salesReportService.getRevenueBetween(start, end));
    }

    @GetMapping("/top-items")
    public List<SalesReportService.TopSellingItem> getTopSellingItems(
            @RequestParam(defaultValue = "5") int limit) {
        return salesReportService.getTopSellingItems(limit);
    }
}
