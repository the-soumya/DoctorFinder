package com.healthportal.controller;

import com.healthportal.entity.Department;
import com.healthportal.repository.DepartmentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@Tag(name = "Departments", description = "Endpoints for hospital clinical departments")
public class DepartmentController {

    @Autowired
    private DepartmentRepository departmentRepository;

    @GetMapping
    @Operation(summary = "Get list of all medical departments")
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create new department (Admin only)")
    public ResponseEntity<Department> createDepartment(@RequestBody Department department) {
        return ResponseEntity.ok(departmentRepository.save(department));
    }
}
