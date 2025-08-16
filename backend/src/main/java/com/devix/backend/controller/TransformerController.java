package com.devix.backend.controller;

import com.devix.backend.dto.TransformerDto;
import com.devix.backend.service.TransformerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@Slf4j
@RequestMapping("/api/transformer")
public class TransformerController {

    @Autowired
    private TransformerService transformerService;

    @PostMapping("/create")
    public ResponseEntity<?> createTransformer(@RequestBody TransformerDto transformerDto) {
        log.info("Creating transformer in Controller " + transformerDto);
        try{
            transformerService.createTransformer(transformerDto);
            return ResponseEntity.ok("Transformer created successfully");
        } catch (Exception e) {
            log.error("Error creating transformer: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error creating transformer: " + e.getMessage());
        }
    }

    @PutMapping(value = "/addBaseImage/{transformerNo}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addBaseImage(@PathVariable String transformerNo, @RequestParam("baseImage") MultipartFile baseImage) {
        log.info("Adding base image for transformer: {}", transformerNo);
        try {
            transformerService.addBaseImage(transformerNo, baseImage);
            return ResponseEntity.ok("Base image added successfully");
        } catch (Exception e) {
            log.error("Error adding base image: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error adding base image: " + e.getMessage());
        }
    }

    @GetMapping("/getAll")
    public ResponseEntity<?> getAllTransformers() {
        log.info("Fetching all transformers in Controller");
        try {
            return ResponseEntity.ok(transformerService.getAllTransformers());
        } catch (Exception e) {
            log.error("Error fetching transformers: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error fetching transformers: " + e.getMessage());
        }
    }
}
