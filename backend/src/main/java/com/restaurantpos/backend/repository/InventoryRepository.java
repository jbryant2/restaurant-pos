package com.restaurantpos.backend.repository;

import com.restaurantpos.backend.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {
    Optional<InventoryItem> findByMenuItemId(Long menuItemId);

    @Query("SELECT i FROM InventoryItem i WHERE i.stockQuantity <= i.lowStockThreshold")
    List<InventoryItem> findLowStockItems();
}
