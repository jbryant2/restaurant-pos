package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.model.InventoryItem;
import com.restaurantpos.backend.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "http://localhost:4200")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @GetMapping
    public List<InventoryItem> getAllInventory() {
        return inventoryService.getAllInventory();
    }

    @GetMapping("/menu-item/{menuItemId}")
    public ResponseEntity<InventoryItem> getInventoryByMenuItemId(@PathVariable Long menuItemId) {
        return inventoryService.getInventoryByMenuItemId(menuItemId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/low-stock")
    public List<InventoryItem> getLowStockItems() {
        return inventoryService.getLowStockItems();
    }

    @PostMapping
    public ResponseEntity<?> createInventoryItem(@RequestBody CreateInventoryRequest request) {
        try {
            InventoryItem item = inventoryService.createInventoryItem(
                    request.menuItemId(), request.stockQuantity(), request.lowStockThreshold(), request.unit());
            return ResponseEntity.status(HttpStatus.CREATED).body(item);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/menu-item/{menuItemId}/adjust")
    public ResponseEntity<?> adjustStock(
            @PathVariable Long menuItemId,
            @RequestParam Integer adjustment) {
        try {
            return ResponseEntity.ok(inventoryService.adjustStock(menuItemId, adjustment));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateInventoryItem(@PathVariable Long id, @RequestBody UpdateInventoryRequest request) {
        try {
            return ResponseEntity.ok(inventoryService.updateInventoryItem(
                    id, request.stockQuantity(), request.lowStockThreshold(), request.unit()));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    record CreateInventoryRequest(Long menuItemId, Integer stockQuantity, Integer lowStockThreshold, String unit) {}
    record UpdateInventoryRequest(Integer stockQuantity, Integer lowStockThreshold, String unit) {}
}
