package com.devix.backend.controller;

import com.devix.backend.dto.InspectionRequestDto;
import com.devix.backend.dto.RecordSheetReqDto;
import com.devix.backend.model.RecordSheet;
import com.devix.backend.service.InspectionImageService;
import com.devix.backend.service.InspectionService;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inspection")
@Slf4j
@CrossOrigin(origins = "*"  )
public class InspectionController {

    private final InspectionService inspectionService;
    private final InspectionImageService inspectionImageService;

    public InspectionController(InspectionService inspectionService, InspectionImageService inspectionImageService) {
        this.inspectionService = inspectionService;
        this.inspectionImageService = inspectionImageService;
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

    @GetMapping("/status/{inspectionNo}")
    public ResponseEntity<?> getInspectionStatus(@PathVariable("inspectionNo") String inspectionNo) {
        try {
            log.info("Fetching status for inspection: {}", inspectionNo);
            return ResponseEntity.ok(inspectionService.inspectionStatus(inspectionNo));
        } catch (Exception e) {
            log.error("Error fetching inspection status: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("getRecord/{inspectionNo}")
    public ResponseEntity<?> getRecordSheetByTransformerNo(@PathVariable("inspectionNo") String inspectionNo) {
        log.info("Fetching record sheet for inspectionNo: {}", inspectionNo);
        try {
            RecordSheet recordSheet = inspectionService.getRecordSheetByInspectionNo(inspectionNo);
            Map<String,Object> comparison = inspectionImageService.getComparisonImage(inspectionNo);

            Map<String, Object> response = Map.of(
                "recordSheet", recordSheet,
                "anomalies", comparison
            );
        
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching record sheet: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PutMapping("/updateRecord/{inspectionNo}")
    public ResponseEntity<?> updateRecordSheet(@PathVariable("inspectionNo") String inspectionNo,
                                               @RequestBody RecordSheetReqDto recordSheetReqDto) {
        log.info("Updating record sheet for inspectionNo: {}", inspectionNo);
        try {
            inspectionService.updateRecordSheet(inspectionNo, recordSheetReqDto);
            return ResponseEntity.ok("Record sheet updated successfully");
        } catch (Exception e) {
            log.error("Error updating record sheet: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

}