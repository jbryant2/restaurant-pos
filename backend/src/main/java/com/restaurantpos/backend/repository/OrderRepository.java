package com.restaurantpos.backend.repository;

import com.restaurantpos.backend.model.Order;
import com.restaurantpos.backend.model.Order.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByTableId(Long tableId);
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByTableIdAndStatus(Long tableId, OrderStatus status);
}
