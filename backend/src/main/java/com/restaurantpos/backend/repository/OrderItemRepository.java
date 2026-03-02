package com.restaurantpos.backend.repository;

import com.restaurantpos.backend.model.Order.OrderStatus;
import com.restaurantpos.backend.model.OrderItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("SELECT oi.menuItem.name, oi.menuItem.category, SUM(oi.quantity), SUM(oi.quantity * oi.unitPrice) " +
           "FROM OrderItem oi JOIN oi.order o WHERE o.status = :status " +
           "GROUP BY oi.menuItem.id, oi.menuItem.name, oi.menuItem.category " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopSellingItems(@Param("status") OrderStatus status, Pageable pageable);
}
