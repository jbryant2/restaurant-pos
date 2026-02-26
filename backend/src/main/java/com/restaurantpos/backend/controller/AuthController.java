package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.model.User;
import com.restaurantpos.backend.service.JwtService;
import com.restaurantpos.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        UserDetails user = userService.loadUserByUsername(request.username());
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, ((User) user).getRole().name()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = userService.registerUser(request.username(), request.password(), request.role());
            String token = jwtService.generateToken(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(token, user.getRole().name()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    record LoginRequest(String username, String password) {}
    record RegisterRequest(String username, String password, User.Role role) {}
    record AuthResponse(String token, String role) {}
}
