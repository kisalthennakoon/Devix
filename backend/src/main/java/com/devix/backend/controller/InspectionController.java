package com.devix.backend.controller;

import com.devix.backend.dto.InspectionRequestDto;
import com.devix.backend.service.InspectionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/inspection")
@Slf4j
@CrossOrigin(origins = "*"  )
public class InspectionController {

    private final InspectionService inspectionService;

    public InspectionController(InspectionService inspectionService) {
        this.inspectionService = inspectionService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createInspection(@RequestBody InspectionRequestDto inspection){
        try{
            log.info("Creating inspection in Controller: {}", inspection);
            inspectionService.createInspection(inspection);
            return ResponseEntity.ok("Inspection created successfully");
        } catch (Exception e) {
            log.error("Error creating inspection: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/get/{inspectionNo}")
    public ResponseEntity<?> getInspection(@PathVariable("inspectionNo") String inspectionNo) {
        try {
            log.info("Fetching inspection with number: {}", inspectionNo);
            return ResponseEntity.ok(inspectionService.getInspection(inspectionNo));
        } catch (Exception e) {
            log.error("Error fetching inspection: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/getAll")
    public ResponseEntity<?> getAllInspections() {
        try {
            log.info("Fetching all inspections");
            return ResponseEntity.ok(inspectionService.getAllInspections());
        } catch (Exception e) {
            log.error("Error fetching inspections: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PutMapping(value = "/addThermalImage/{inspectionNo}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addThermalImage(@PathVariable("inspectionNo") String inspectionNo,
                                             @RequestParam("imageCondition") String imageCondition,
                                             @RequestParam("thermalImage") MultipartFile thermalImage) {
        try {
            log.info("Adding thermal image for inspection: {}", inspectionNo);
            inspectionService.addThermalImage(inspectionNo, imageCondition, thermalImage);
            return ResponseEntity.ok("Thermal image added successfully");
        } catch (Exception e) {
            log.error("Error adding thermal image: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/getComparisonImage/{inspectionNo}")
    public ResponseEntity<?> getComparisonImage(@PathVariable("inspectionNo") String inspectionNo) {
        try {
            log.info("Fetching comparison image for inspection: {}", inspectionNo);
            return ResponseEntity.ok(inspectionService.getComparisonImage(inspectionNo));
        } catch (Exception e) {
            log.error("Error fetching comparison image: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/getAll/{transformerNo}")
    public ResponseEntity<?> getInspectionsByTransformerNo(@PathVariable("transformerNo") String transformerNo) {
        try {
            log.info("Fetching inspections for transformer: {}", transformerNo);
            return ResponseEntity.ok(inspectionService.getInspectionsByTransformerNo(transformerNo));
        } catch (Exception e) {
            log.error("Error fetching inspections: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

}
