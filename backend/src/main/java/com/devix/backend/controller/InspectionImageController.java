package com.devix.backend.controller;

import com.devix.backend.service.InspectionImageService;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@Slf4j
@RequestMapping("/api/inspectionImage")
@CrossOrigin(origins = "*")
public class InspectionImageController {

    private final InspectionImageService inspectionImageService;

    public InspectionImageController(InspectionImageService inspectionService) {
        this.inspectionImageService = inspectionService;
    }

    @PostMapping(value = "/add/{inspectionNo}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addThermalImage(@PathVariable("inspectionNo") String inspectionNo,
                                             @RequestParam("transformerNo") String transformerNo,
                                             @RequestParam("imageCondition") String imageCondition,
                                             @RequestParam("thermalImage") MultipartFile thermalImage,
                                             @RequestParam("uploadedBy") String uploadedBy,
                                             @RequestParam("uploadedDate") String uploadedDate,
                                             @RequestParam("uploadedTime") String uploadedTime) {
        try {
            log.info("Adding thermal image for inspection: {}", inspectionNo);
            inspectionImageService.addThermalImage(inspectionNo, transformerNo, imageCondition, thermalImage, uploadedBy, uploadedDate, uploadedTime);
            return ResponseEntity.ok("Thermal image added successfully");
        } catch (Exception e) {
            log.error("Error adding thermal image: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/get/{inspectionNo}")
    public ResponseEntity<?> getComparisonImage(@PathVariable("inspectionNo") String inspectionNo) {
        try {
            log.info("Fetching comparison image for inspection: {}", inspectionNo);
            return ResponseEntity.ok(inspectionImageService.getComparisonImage(inspectionNo));
        } catch (Exception e) {
            log.error("Error fetching comparison image: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/getLastUpdatedDate/{inspectionNo}")
    public ResponseEntity<?> getLastUpdatedDate(@PathVariable("inspectionNo") String inspectionNo) {
        try {
            log.info("Fetching last updated date for inspection: {}", inspectionNo);
            return ResponseEntity.ok(inspectionImageService.getLastUpdatedDate(inspectionNo));
        } catch (Exception e) {
            log.error("Error fetching last updated date: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/createEvalResults")
    public ResponseEntity<?> createEvalResults(@RequestBody List<Map<String, String>> evalResultsList) {
        try {
            log.info("Creating evaluation results");
            inspectionImageService.createEvalResults(evalResultsList);
            return ResponseEntity.ok("Evaluation results created successfully");
        } catch (Exception e) {
            log.error("Error creating evaluation results: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

}
