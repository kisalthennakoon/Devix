package com.devix.backend.service.Impl;

import com.devix.backend.model.*;
import com.devix.backend.repo.AiResultsRepo;
import com.devix.backend.repo.BaseImageRepo;
import com.devix.backend.repo.EvalResultsRepo;
import com.devix.backend.repo.InspectionImageRepo;
import com.devix.backend.repo.InspectionRepo;
import com.devix.backend.service.AiService;
import com.devix.backend.service.InspectionImageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class InspectionImageServiceImpl implements InspectionImageService {

    private final InspectionImageRepo inspectionImageRepo;
    private final BaseImageRepo baseImageRepo;
    // private final GoogleDriveService googleDriveService;
    private final LocalImageService localImageService;
    private final InspectionRepo inspectionRepo;
    private final AiResultsRepo aiResultsRepo;
    private final EvalResultsRepo evalResultsRepo;
    private final AiService aiService;

    public InspectionImageServiceImpl(InspectionImageRepo inspectionImageRepo, BaseImageRepo baseImageRepo,
            LocalImageService localImageService, InspectionRepo inspectionRepo, AiResultsRepo aiResultsRepo,
            EvalResultsRepo evalResultsRepo, AiService aiService) {
        this.inspectionImageRepo = inspectionImageRepo;
        this.baseImageRepo = baseImageRepo;
        this.localImageService = localImageService;
        this.inspectionRepo = inspectionRepo;
        this.aiResultsRepo = aiResultsRepo;
        this.evalResultsRepo = evalResultsRepo;
        this.aiService = aiService;
    }

    @Override
    public Map<String, Object> getComparisonImage(String inspectionNo) throws Exception {
        try {
            log.info("Fetching comparison images for inspection: {}", inspectionNo);

            InspectionImage inspectionImage = inspectionImageRepo.findByInspectionNo(inspectionNo);
            Inspection inspection = inspectionRepo.findByInspectionNo(inspectionNo);

            Map<String, Object> images = new HashMap<>();
            BaselineImage baselineImage = baseImageRepo.findByTransformerNo(inspection.getTransformerNo());

            String baseImageUrl = null;
            String baseImageUploadedDate = null;
            String baseImageUploadedTime = null;
            String baseImageUploadedBy = null;

            String inspectionImageUrl = null;
            String inspectionImageUploadedDate = null;
            String inspectionImageUploadedTime = null;
            String inspectionImageUploadedBy = null;

            if (inspectionImage != null) {
                inspectionImageUrl = inspectionImage.getThermalImageUrl();
                inspectionImageUploadedDate = inspectionImage.getUploadedDate();
                inspectionImageUploadedTime = inspectionImage.getUploadedTime();
                inspectionImageUploadedBy = inspectionImage.getUploadedBy();
            }
            if (baselineImage != null) {
                baseImageUrl = "exist";
            }

            if (baselineImage != null && inspectionImage != null) {
                switch (inspectionImage.getThermalImageCondition()) {

                    case "Sunny" -> {
                        baseImageUrl = localImageService.getImage(baselineImage.getSunnyImageUrl());
                        baseImageUploadedDate = baselineImage.getUploadedDate();
                        baseImageUploadedTime = baselineImage.getUploadedTime();
                        baseImageUploadedBy = baselineImage.getUploadedBy();
                    }
                    case "Cloudy" -> {
                        baseImageUrl = localImageService.getImage(baselineImage.getCloudyImageUrl());
                        baseImageUploadedDate = baselineImage.getUploadedDate();
                        baseImageUploadedTime = baselineImage.getUploadedTime();
                        baseImageUploadedBy = baselineImage.getUploadedBy();
                    }
                    case "Rainy" -> {
                        baseImageUrl = localImageService.getImage(baselineImage.getRainyImageUrl());
                        baseImageUploadedDate = baselineImage.getUploadedDate();
                        baseImageUploadedTime = baselineImage.getUploadedTime();
                        baseImageUploadedBy = baselineImage.getUploadedBy();
                    }
                }
            }

            images.put("baseImageUrl", baseImageUrl);
            images.put("baseImageUploadedDate", baseImageUploadedDate);
            images.put("baseImageUploadedTime", baseImageUploadedTime);
            images.put("baseImageUploadedBy", baseImageUploadedBy);

            images.put("thermal", localImageService.getImage(inspectionImageUrl));
            images.put("thermalUploadedDate", inspectionImageUploadedDate);
            images.put("thermalUploadedTime", inspectionImageUploadedTime);
            images.put("thermalUploadedBy", inspectionImageUploadedBy);

            List<EvalResults> evalResults = evalResultsRepo.findAllByInspectionNo(inspectionNo);
            List<Map<String, String>> resultsList;
            if (evalResults.isEmpty()) {
                log.info("No evaluation results found for inspection: {}", inspectionNo);
                List<AiResults> aiResults = aiResultsRepo.findAllByInspectionNo(inspectionNo);
                resultsList = aiResults.stream()
                        .map(result -> {
                            Map<String, String> map = new HashMap<>();
                            map.put("faultStatus", String.valueOf(result.getAnomalyStatus()));
                            map.put("faultType", String.valueOf(result.getFaultType()));
                            map.put("faultSeverity", String.valueOf(result.getFaultSeverity()));
                            map.put("faultConfidence", String.valueOf(result.getFaultConfidence()));
                            map.put("XCoordinate", String.valueOf(result.getXCoordinate()));
                            map.put("YCoordinate", String.valueOf(result.getYCoordinate()));
                            map.put("bbox", String.valueOf(result.getBbox()));
                            map.put("areaPx", String.valueOf(result.getAreaPx()));
                            map.put("hotspotX", String.valueOf(result.getHotspotX()));
                            map.put("hotspotY", String.valueOf(result.getHotspotY()));
                            return map;
                        })
                        .toList();
            } else {
                log.info("Evaluation results found for inspection: {}", inspectionNo);
                resultsList = evalResults.stream()
                        .map(result -> {
                            Map<String, String> map = new HashMap<>();
                            map.put("faultStatus", String.valueOf(result.getAnomalyStatus()));
                            map.put("faultType", String.valueOf(result.getFaultType()));
                            map.put("faultSeverity", String.valueOf(result.getFaultSeverity()));
                            map.put("faultConfidence", String.valueOf(result.getFaultConfidence()));
                            map.put("XCoordinate", String.valueOf(result.getXCoordinate()));
                            map.put("YCoordinate", String.valueOf(result.getYCoordinate()));
                            map.put("bbox", String.valueOf(result.getBbox()));
                            map.put("areaPx", String.valueOf(result.getAreaPx()));
                            map.put("hotspotX", String.valueOf(result.getHotspotX()));
                            map.put("hotspotY", String.valueOf(result.getHotspotY()));
                            map.put("notes", String.valueOf(result.getNotes()));
                            map.put("evaluatedBy", String.valueOf(result.getEvaluatedBy()));
                            return map;
                        })
                        .toList();
            }

            images.put("aiResults", resultsList);
            log.info("AI Results: {}", images.get("aiResults"));
            return images;
        } catch (Exception e) {
            log.error("Error fetching comparison images: {}", e.getMessage());
            throw new Exception("Error fetching comparison images: " + e.getMessage());
        }
    }

    @Override
    public void addThermalImage(String inspectionNo, String transformerNo, String imageCondition,
            MultipartFile thermalImage, String uploadedBy, String uploadedDate, String uploadedTime)
            throws Exception {
        try {
            log.info("Adding thermal image for inspection: {}", inspectionNo);

            InspectionImage inspectionImage = new InspectionImage();

            inspectionImage.setInspectionNo(inspectionNo);
            inspectionImage.setTransformerNo(transformerNo);
            String imageUrl = localImageService.uploadImage(thermalImage);
            inspectionImage.setThermalImageUrl(imageUrl);
            inspectionImage.setThermalImageCondition(imageCondition);
            inspectionImage.setUploadedBy(uploadedBy);
            inspectionImage.setUploadedDate(uploadedDate);
            inspectionImage.setUploadedTime(uploadedTime);

            inspectionImageRepo.save(inspectionImage);

            Inspection inspection = inspectionRepo.findByInspectionNo(inspectionNo);
            inspection.setInspectionStatus("pending");
            inspectionRepo.save(inspection);

            log.info("Thermal image added successfully");
        } catch (Exception e) {
            log.error("Error adding thermal image: {}", e.getMessage());
            throw new Exception("Error adding thermal image: " + e.getMessage());
        }
    }

    @Override
    public Map<String, String> getLastUpdatedDate(String inspectionNo) throws Exception {
        try {
            log.info("Fetching last updated date for inspection: {}", inspectionNo);
            InspectionImage inspectionImage = inspectionImageRepo.findByInspectionNo(inspectionNo);
            Inspection inspection = inspectionRepo.findByInspectionNo(inspectionNo);
            List<EvalResults> evalResults = evalResultsRepo.findAllByInspectionNo(inspectionNo);

            Map<String, String> lastUpdatedInfo = new HashMap<>();

            if (evalResults != null && !evalResults.isEmpty()) {
                String evaluatedDateTime = evalResults.get(0).getEvaluatedDate();

                // Split datetime into date and time components
                String evaluatedDate = "";
                String evaluatedTime = "";
                
                if (evaluatedDateTime != null && !evaluatedDateTime.isEmpty()) {
                    // Assuming format like "2025-10-21 16:31:54" or "2025-10-21T16:31:54"
                    if (evaluatedDateTime.contains(" ")) {
                        String[] parts = evaluatedDateTime.split(" ", 2);
                        evaluatedDate = parts[0];
                        evaluatedTime = parts.length > 1 ? parts[1] : "";
                    } else if (evaluatedDateTime.contains("T")) {
                        String[] parts = evaluatedDateTime.split("T", 2);
                        evaluatedDate = parts[0];
                        evaluatedTime = parts.length > 1 ? parts[1] : "";
                    } else {
                        // If no time component found, treat entire string as date
                        evaluatedDate = evaluatedDateTime;
                    }
                }
                
                lastUpdatedInfo.put("lastUpdatedDate", evaluatedDate);
                lastUpdatedInfo.put("lastUpdatedTime", evaluatedTime);
                
            } else if (inspectionImage != null) {
                lastUpdatedInfo.put("lastUpdatedDate", inspectionImage.getUploadedDate());
                lastUpdatedInfo.put("lastUpdatedTime", inspectionImage.getUploadedTime());
            } else if (inspection != null) {
                lastUpdatedInfo.put("lastUpdatedDate", inspection.getInspectionDate());
                lastUpdatedInfo.put("lastUpdatedTime", inspection.getInspectionTime());
            }
            return lastUpdatedInfo;
        } catch (Exception e) {
            log.error("Error fetching last updated date: {}", e.getMessage());
            throw new Exception("Error fetching last updated date: " + e.getMessage());
        }
    }

    @Override
    public void createEvalResults(List<Map<String, String>> evalResultsList) throws Exception {
        try {
            log.info("Creating evaluation results");

            List<EvalResults> evalResultsInit = evalResultsRepo.findAllByInspectionNo(evalResultsList.get(0).get("inspectionNo"));
            if(!evalResultsInit.isEmpty()){
                evalResultsRepo.deleteAll(evalResultsInit);
            }

            for (Map<String, String> evalResultMap : evalResultsList) {
                EvalResults evalResults = new EvalResults();

                evalResults.setInspectionNo(evalResultMap.get("inspectionNo"));
                evalResults.setTransformerNo(evalResultMap.get("transformerNo"));
                evalResults.setAnomalyStatus(evalResultMap.get("anomalyStatus"));
                evalResults.setFaultType(evalResultMap.get("faultType"));
                evalResults.setFaultSeverity(evalResultMap.get("faultSeverity"));
                evalResults.setFaultConfidence(evalResultMap.get("faultConfidence"));
                evalResults.setXCoordinate(evalResultMap.get("XCoordinate"));
                evalResults.setYCoordinate(evalResultMap.get("YCoordinate"));
                evalResults.setBbox(evalResultMap.get("bbox"));
                evalResults.setAreaPx(evalResultMap.get("areaPx"));
                evalResults.setHotspotX(evalResultMap.get("hotspotX"));
                evalResults.setHotspotY(evalResultMap.get("hotspotY"));
                evalResults.setNotes(evalResultMap.get("notes"));
                evalResults.setEvaluatedBy(evalResultMap.get("evaluatedBy"));
                evalResults.setEvaluatedDate(evalResultMap.get("evaluatedDate"));

                evalResultsRepo.save(evalResults);
            }
            List<AiResults> aiResults = aiResultsRepo.findAllByInspectionNo(evalResultsList.get(0).get("inspectionNo"));
            List<EvalResults> finalEvalResults = evalResultsRepo.findAllByInspectionNo(evalResultsList.get(0).get("inspectionNo"));
            String inspectionImagePath = inspectionImageRepo.findByInspectionNo(evalResultsList.get(0).get("inspectionNo")).getThermalImageUrl();
            
            Map<String, Object> requestData = new HashMap<>();
            requestData.put("current_detections", aiResults);
            requestData.put("edits", finalEvalResults);
            requestData.put("imageUrl", inspectionImagePath);

            aiService.updateThresholds(requestData);

            log.info("Evaluation results created successfully");
        } catch (Exception e) {
            log.error("Error creating evaluation results: {}", e.getMessage());
            throw new Exception("Error creating evaluation results: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> getReport(String inspectionNo) throws Exception {
            log.info("Generating report for inspection: {}", inspectionNo);
        try {
            
            Map<String, Object> reportData = new HashMap<>();
            List<AiResults> aiResults = aiResultsRepo.findAllByInspectionNo(inspectionNo);
            List<EvalResults> evalResults = evalResultsRepo.findAllByInspectionNo(inspectionNo);

            String inspectionNoReport = inspectionNo;
            String transformerNoReport = inspectionRepo.findByInspectionNo(inspectionNo).getTransformerNo();

            reportData.put("Inspection No", inspectionNoReport);
            reportData.put("Transformer No", transformerNoReport);

            Long baselineImageId = baseImageRepo.findByTransformerNo(transformerNoReport).getId();
            reportData.put("Baseline Image ID", baselineImageId);

            Long inspectionImageId = inspectionImageRepo.findByInspectionNo(inspectionNo).getId();
            reportData.put("Inspection Image ID", inspectionImageId);

            

            if (!evalResults.isEmpty()) {
                reportData.put("Final Accepted Anomalies", evalResults);
                reportData.put("Evaluated By", evalResults.get(0).getEvaluatedBy());
                reportData.put("Evaluated Date", evalResults.get(0).getEvaluatedDate());
            } else {
                reportData.put("Final Accepted Anomalies", "No evaluation results available");
            }

            if (!aiResults.isEmpty()) {
                reportData.put("Model Predicted Anomalies", aiResults);
            } else {
                reportData.put("Model Predicted Anomalies", "No AI results available");
            }


            return reportData;

        } catch (Exception e) {
            log.error("Error generating report: {}", e.getMessage());
            throw new Exception("Error generating report: " + e.getMessage());
        }
    }
}