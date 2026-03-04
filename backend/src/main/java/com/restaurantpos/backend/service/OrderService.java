package com.restaurantpos.backend.service;

import com.restaurantpos.backend.model.*;
import com.restaurantpos.backend.model.Order.OrderStatus;
import com.restaurantpos.backend.model.RestaurantTable.TableStatus;
import com.restaurantpos.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private RestaurantTableRepository tableRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public List<Order> getOrdersByTable(Long tableId) {
        return orderRepository.findByTableId(tableId);
    }

    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    public Order createOrder(Long tableId, String notes) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found with id: " + tableId));

        Order order = new Order();
        order.setTable(table);
        order.setStatus(OrderStatus.PENDING);
        order.setNotes(notes);
        order.setTotalAmount(BigDecimal.ZERO);

        table.setStatus(TableStatus.OCCUPIED);
        tableRepository.save(table);

        return orderRepository.save(order);
    }

    public OrderItem addItemToOrder(Long orderId, Long menuItemId, Integer quantity, String notes) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        if (order.getStatus() == OrderStatus.COMPLETED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Cannot modify a " + order.getStatus() + " order");
        }

        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new RuntimeException("Menu item not found with id: " + menuItemId));

        if (!menuItem.getAvailable()) {
            throw new RuntimeException("Menu item is not available: " + menuItem.getName());
        }

        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setMenuItem(menuItem);
        item.setQuantity(quantity);
        item.setUnitPrice(menuItem.getPrice());  // snapshot price at time of order
        item.setNotes(notes);

        OrderItem savedItem = orderItemRepository.save(item);
        recalculateTotal(order);
        return savedItem;
    }

    public void removeItemFromOrder(Long orderId, Long itemId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Order item not found with id: " + itemId));

        order.getItems().remove(item);
        orderItemRepository.delete(item);
        recalculateTotal(order);
    }

    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        order.setStatus(status);

        if (status == OrderStatus.COMPLETED || status == OrderStatus.CANCELLED) {
            RestaurantTable table = order.getTable();
            boolean hasOtherActiveOrders = orderRepository.findByTableId(table.getId())
                    .stream()
                    .anyMatch(o -> !o.getId().equals(orderId)
                            && o.getStatus() != OrderStatus.COMPLETED
                            && o.getStatus() != OrderStatus.CANCELLED);

            if (!hasOtherActiveOrders) {
                table.setStatus(TableStatus.AVAILABLE);
                tableRepository.save(table);
            }
        }

        return orderRepository.save(order);
    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }

    private void recalculateTotal(Order order) {
        BigDecimal total = order.getItems().stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotalAmount(total);
        orderRepository.save(order);
    }
}
