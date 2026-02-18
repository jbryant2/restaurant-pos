package com.restaurantpos.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "restaurant_tables")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantTable {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String tableNumber;  // "Table 1", "Table 2", etc.
    
    @Column(nullable = false)
    private Integer capacity;  // Number of people
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TableStatus status;
    
    private String location;  // "Window", "Patio", "Main Dining", etc.
    
    public enum TableStatus {
        AVAILABLE,
        OCCUPIED,
        RESERVED,
        MAINTENANCE
    }
}