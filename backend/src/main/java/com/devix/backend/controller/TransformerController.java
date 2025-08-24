package com.devix.backend.controller;

import com.devix.backend.dto.TransformerRequestDto;
import com.devix.backend.service.TransformerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @PutMapping(value = "/addBaseImage/{transformerNo}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addBaseImage(@PathVariable("transformerNo") String transformerNo,
                                          @RequestParam("baseImageSunny") MultipartFile baseImageSunny,
                                          @RequestParam("baseImageCloudy") MultipartFile baseImageCloudy,
                                          @RequestParam("baseImageRainy") MultipartFile baseImageRainy) {

        log.info("Adding base image for transformer: {}", transformerNo);
        try {
            transformerService.addBaseImage(transformerNo, baseImageSunny, baseImageCloudy, baseImageRainy);
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

    @GetMapping("/get/{transformerNo}")
    public ResponseEntity<?> getBaseImages(@PathVariable("transformerNo") String transformerNo) {
        log.info("Fetching base images for transformer: {}", transformerNo);
        try {
            return ResponseEntity.ok(transformerService.getBaseImage(transformerNo));
        } catch (Exception e) {
            log.error("Error fetching base images: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error fetching base images: " + e.getMessage());
        }
    }

    @DeleteMapping("deleteBaseImage/{transformerNo}")
    public ResponseEntity<?> deleteBaseImage(@PathVariable("transformerNo") String transformerNo) {
        log.info("Deleting base image for transformer: {}", transformerNo);
        try{
            transformerService.deleteBaseImage(transformerNo);
            return ResponseEntity.ok("Base image deleted successfully");
        }catch(Exception e){
            log.info("Error deleting base image: {}", e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
