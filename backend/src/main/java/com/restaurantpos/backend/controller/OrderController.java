package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.model.Order;
import com.restaurantpos.backend.model.Order.OrderStatus;
import com.restaurantpos.backend.model.OrderItem;
import com.restaurantpos.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:4200")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/table/{tableId}")
    public List<Order> getOrdersByTable(@PathVariable Long tableId) {
        return orderService.getOrdersByTable(tableId);
    }

    @GetMapping("/status/{status}")
    public List<Order> getOrdersByStatus(@PathVariable OrderStatus status) {
        return orderService.getOrdersByStatus(status);
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody CreateOrderRequest request) {
        Order order = orderService.createOrder(request.tableId(), request.notes());
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<?> addItemToOrder(
            @PathVariable Long id,
            @RequestBody AddItemRequest request) {
        try {
            OrderItem item = orderService.addItemToOrder(id, request.menuItemId(), request.quantity(), request.notes());
            return ResponseEntity.status(HttpStatus.CREATED).body(item);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}/items/{itemId}")
    public ResponseEntity<Void> removeItemFromOrder(
            @PathVariable Long id,
            @PathVariable Long itemId) {
        orderService.removeItemFromOrder(id, itemId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        try {
            Order updated = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    record CreateOrderRequest(Long tableId, String notes) {}
    record AddItemRequest(Long menuItemId, Integer quantity, String notes) {}
}
