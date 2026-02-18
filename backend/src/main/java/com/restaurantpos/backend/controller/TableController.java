package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.model.RestaurantTable;
import com.restaurantpos.backend.model.RestaurantTable.TableStatus;
import com.restaurantpos.backend.service.TableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
@CrossOrigin(origins = "http://localhost:4200")
public class TableController {
    
    @Autowired
    private TableService tableService;
    
    @GetMapping
    public List<RestaurantTable> getAllTables() {
        return tableService.getAllTables();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<RestaurantTable> getTableById(@PathVariable Long id) {
        return tableService.getTableById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/status/{status}")
    public List<RestaurantTable> getTablesByStatus(@PathVariable TableStatus status) {
        return tableService.getTablesByStatus(status);
    }
    
    @GetMapping("/available/{partySize}")
    public List<RestaurantTable> getAvailableTablesForPartySize(@PathVariable Integer partySize) {
        return tableService.getAvailableTablesForPartySize(partySize);
    }
    
    @PostMapping
    public ResponseEntity<RestaurantTable> createTable(@RequestBody RestaurantTable table) {
        RestaurantTable createdTable = tableService.createTable(table);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTable);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<RestaurantTable> updateTable(
            @PathVariable Long id, 
            @RequestBody RestaurantTable tableDetails) {
        try {
            RestaurantTable updatedTable = tableService.updateTable(id, tableDetails);
            return ResponseEntity.ok(updatedTable);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<RestaurantTable> updateTableStatus(
            @PathVariable Long id,
            @RequestParam TableStatus status) {
        try {
            RestaurantTable updatedTable = tableService.updateTableStatus(id, status);
            return ResponseEntity.ok(updatedTable);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTable(@PathVariable Long id) {
        tableService.deleteTable(id);
        return ResponseEntity.noContent().build();
    }
}