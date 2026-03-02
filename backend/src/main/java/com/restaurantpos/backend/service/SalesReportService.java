package com.restaurantpos.backend.service;

import com.restaurantpos.backend.model.Order.OrderStatus;
import com.restaurantpos.backend.repository.OrderItemRepository;
import com.restaurantpos.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SalesReportService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    public SalesSummary getSalesSummary() {
        BigDecimal totalRevenue = orderRepository.sumTotalAmountByStatus(OrderStatus.COMPLETED);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        long totalOrders = orderRepository.count();
        long completedOrders = orderRepository.countByStatus(OrderStatus.COMPLETED);
        long cancelledOrders = orderRepository.countByStatus(OrderStatus.CANCELLED);

        List<TopSellingItem> topItems = getTopSellingItems(5);

        return new SalesSummary(totalRevenue, totalOrders, completedOrders, cancelledOrders, topItems);
    }

    public BigDecimal getRevenueBetween(LocalDateTime start, LocalDateTime end) {
        BigDecimal revenue = orderRepository.sumTotalAmountByStatusAndDateRange(OrderStatus.COMPLETED, start, end);
        return revenue != null ? revenue : BigDecimal.ZERO;
    }

    public List<TopSellingItem> getTopSellingItems(int limit) {
        List<Object[]> rows = orderItemRepository.findTopSellingItems(
                OrderStatus.COMPLETED, PageRequest.of(0, limit));
        return rows.stream()
                .map(row -> new TopSellingItem(
                        (String) row[0],
                        (String) row[1],
                        ((Number) row[2]).longValue(),
                        (BigDecimal) row[3]))
                .toList();
    }

    public record SalesSummary(
            BigDecimal totalRevenue,
            Long totalOrders,
            Long completedOrders,
            Long cancelledOrders,
            List<TopSellingItem> topItems) {}

    public record TopSellingItem(
            String itemName,
            String category,
            Long totalQuantity,
            BigDecimal totalRevenue) {}
}
