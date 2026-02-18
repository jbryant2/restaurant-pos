package com.restaurantpos.backend.service;

import com.restaurantpos.backend.model.RestaurantTable;
import com.restaurantpos.backend.model.RestaurantTable.TableStatus;
import com.restaurantpos.backend.repository.RestaurantTableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class TableService {
    
    @Autowired
    private RestaurantTableRepository tableRepository;
    
    public List<RestaurantTable> getAllTables() {
        return tableRepository.findAll();
    }
    
    public Optional<RestaurantTable> getTableById(Long id) {
        return tableRepository.findById(id);
    }
    
    public Optional<RestaurantTable> getTableByNumber(String tableNumber) {
        return tableRepository.findByTableNumber(tableNumber);
    }
    
    public List<RestaurantTable> getTablesByStatus(TableStatus status) {
        return tableRepository.findByStatus(status);
    }
    
    public List<RestaurantTable> getAvailableTablesForPartySize(Integer partySize) {
        return tableRepository.findByCapacityGreaterThanEqual(partySize)
                .stream()
                .filter(table -> table.getStatus() == TableStatus.AVAILABLE)
                .toList();
    }
    
    public RestaurantTable createTable(RestaurantTable table) {
        if (table.getStatus() == null) {
            table.setStatus(TableStatus.AVAILABLE);
        }
        return tableRepository.save(table);
    }
    
    public RestaurantTable updateTable(Long id, RestaurantTable tableDetails) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Table not found with id: " + id));
        
        table.setTableNumber(tableDetails.getTableNumber());
        table.setCapacity(tableDetails.getCapacity());
        table.setStatus(tableDetails.getStatus());
        table.setLocation(tableDetails.getLocation());
        
        return tableRepository.save(table);
    }
    
    public void deleteTable(Long id) {
        tableRepository.deleteById(id);
    }
    
    public RestaurantTable updateTableStatus(Long id, TableStatus status) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Table not found with id: " + id));
        table.setStatus(status);
        return tableRepository.save(table);
    }
}