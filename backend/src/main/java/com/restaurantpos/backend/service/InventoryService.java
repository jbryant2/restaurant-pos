package com.restaurantpos.backend.service;

import com.restaurantpos.backend.model.InventoryItem;
import com.restaurantpos.backend.model.MenuItem;
import com.restaurantpos.backend.repository.InventoryRepository;
import com.restaurantpos.backend.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    public List<InventoryItem> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public Optional<InventoryItem> getInventoryByMenuItemId(Long menuItemId) {
        return inventoryRepository.findByMenuItemId(menuItemId);
    }

    public List<InventoryItem> getLowStockItems() {
        return inventoryRepository.findLowStockItems();
    }

    public InventoryItem createInventoryItem(Long menuItemId, Integer stockQuantity, Integer lowStockThreshold, String unit) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new RuntimeException("Menu item not found with id: " + menuItemId));

        if (inventoryRepository.findByMenuItemId(menuItemId).isPresent()) {
            throw new RuntimeException("Inventory already tracked for: " + menuItem.getName());
        }

        InventoryItem item = new InventoryItem();
        item.setMenuItem(menuItem);
        item.setStockQuantity(stockQuantity);
        item.setLowStockThreshold(lowStockThreshold != null ? lowStockThreshold : 10);
        item.setUnit(unit);
        return inventoryRepository.save(item);
    }

    public InventoryItem adjustStock(Long menuItemId, Integer adjustment) {
        InventoryItem item = inventoryRepository.findByMenuItemId(menuItemId)
                .orElseThrow(() -> new RuntimeException("No inventory tracked for menu item id: " + menuItemId));

        int newQuantity = item.getStockQuantity() + adjustment;
        if (newQuantity < 0) {
            throw new RuntimeException("Insufficient stock for: " + item.getMenuItem().getName());
        }
        item.setStockQuantity(newQuantity);

        if (newQuantity == 0) {
            item.getMenuItem().setAvailable(false);
            menuItemRepository.save(item.getMenuItem());
        }

        return inventoryRepository.save(item);
    }

    public InventoryItem updateInventoryItem(Long id, Integer stockQuantity, Integer lowStockThreshold, String unit) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory item not found with id: " + id));
        if (stockQuantity != null) item.setStockQuantity(stockQuantity);
        if (lowStockThreshold != null) item.setLowStockThreshold(lowStockThreshold);
        if (unit != null) item.setUnit(unit);
        return inventoryRepository.save(item);
    }
}
