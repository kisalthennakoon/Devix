package com.devix.backend.controller;

import com.devix.backend.dto.TransformerRequestDto;
import com.devix.backend.service.TransformerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@Slf4j
@RequestMapping("/api/transformer")
@CrossOrigin(origins = "*")
public class TransformerController {

    private final TransformerService transformerService;

    public TransformerController(TransformerService transformerService) {
        this.transformerService = transformerService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createTransformer(@RequestBody TransformerRequestDto transformerRequestDto) {
        log.info("Creating transformer in Controller {}", transformerRequestDto);
        try{
            transformerService.createTransformer(transformerRequestDto);
            return ResponseEntity.ok("Transformer created successfully");
        } catch (Exception e) {
            log.error("Error creating transformer: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(e.getMessage());
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

    @PutMapping("/update")
    public ResponseEntity<?> updateTransformer(@RequestBody TransformerRequestDto transformerRequestDto) {
        log.info("Updating transformer {} ", transformerRequestDto);
        try {
            transformerService.updateTransformer(transformerRequestDto);
            return ResponseEntity.ok("Transformer updated successfully");
        } catch (Exception e) {
            log.error("Error updating transformer: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @DeleteMapping("/delete/{transformerNo}")
    public ResponseEntity<?> deleteTransformer(@PathVariable String transformerNo) {
        log.info("Deleting transformer with transformerNo: {}", transformerNo);
        try {
            transformerService.deleteTransformer(transformerNo);
            return ResponseEntity.ok("Transformer deleted successfully");
        } catch (Exception e) {
            log.error("Error deleting transformer: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("getLastInspected/{transformerNo}")
    public ResponseEntity<?> getLastInspectedDate(@PathVariable("transformerNo") String transformerNo) {
        log.info("Fetching last inspected date for transformerNo: {}", transformerNo);
        try {
            return ResponseEntity.ok(transformerService.lastInspectedDate(transformerNo));
        } catch (Exception e) {
            log.error("Error fetching last inspected date: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

}
