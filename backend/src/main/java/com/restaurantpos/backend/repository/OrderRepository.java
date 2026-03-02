package com.restaurantpos.backend.repository;

import com.restaurantpos.backend.model.Order;
import com.restaurantpos.backend.model.Order.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByTableId(Long tableId);
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByTableIdAndStatus(Long tableId, OrderStatus status);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = :status")
    BigDecimal sumTotalAmountByStatus(@Param("status") OrderStatus status);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = :status AND o.createdAt BETWEEN :start AND :end")
    BigDecimal sumTotalAmountByStatusAndDateRange(
            @Param("status") OrderStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    Long countByStatus(@Param("status") OrderStatus status);
}
