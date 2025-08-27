package com.devix.backend.controller;

import com.devix.backend.service.BaselineImageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@Slf4j
@RequestMapping("/api/baseImage")
@CrossOrigin(origins = "*")
public class BaseImageController {

    private final BaselineImageService baselineImageService;
    public BaseImageController(BaselineImageService baselineImageService) {
        this.baselineImageService = baselineImageService;
    }

    @PostMapping(value = "/add/{transformerNo}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addBaseImage(@PathVariable("transformerNo") String transformerNo,
                                          @RequestParam("baseImageSunny") MultipartFile baseImageSunny,
                                          @RequestParam("baseImageCloudy") MultipartFile baseImageCloudy,
                                          @RequestParam("baseImageRainy") MultipartFile baseImageRainy,
                                          @RequestParam("uploadedBy") String uploadedBy,
                                          @RequestParam("uploadedDate") String uploadedDate,
                                          @RequestParam("uploadedTime") String uploadedTime) {

        log.info("Adding base image for transformer: {}", transformerNo);
        try {
            baselineImageService.addBaseImage(transformerNo, baseImageSunny, baseImageCloudy, baseImageRainy, uploadedBy, uploadedDate, uploadedTime);
            return ResponseEntity.ok("Base image added successfully");
        } catch (Exception e) {
            log.error("Error adding base image: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body( e.getMessage());
        }
    }

    @GetMapping("/get/{transformerNo}")
    public ResponseEntity<?> getBaseImages(@PathVariable("transformerNo") String transformerNo) {
        log.info("Fetching base images for transformer: {}", transformerNo);
        try {
            return ResponseEntity.ok(baselineImageService.getBaseImage(transformerNo));
        } catch (Exception e) {
            log.error("Error fetching base images: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @DeleteMapping("delete/{transformerNo}")
    public ResponseEntity<?> deleteBaseImage(@PathVariable("transformerNo") String transformerNo) {
        log.info("Deleting base image for transformer: {}", transformerNo);
        try{
            baselineImageService.deleteBaseImage(transformerNo);
            return ResponseEntity.ok("Base image deleted successfully");
        }catch(Exception e){
            log.info("Error deleting base image: {}", e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
