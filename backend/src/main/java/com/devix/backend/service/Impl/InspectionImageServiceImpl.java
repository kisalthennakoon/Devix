package com.devix.backend.service.Impl;

import com.devix.backend.model.*;
import com.devix.backend.repo.AiResultsRepo;
import com.devix.backend.repo.BaseImageRepo;
import com.devix.backend.repo.InspectionImageRepo;
import com.devix.backend.repo.InspectionRepo;
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
//    private final GoogleDriveService googleDriveService;
    private final LocalImageService localImageService;
    private final InspectionRepo inspectionRepo;
    private final AiResultsRepo aiResultsRepo;

    public InspectionImageServiceImpl(InspectionImageRepo inspectionImageRepo, BaseImageRepo baseImageRepo,
                                      LocalImageService localImageService, InspectionRepo inspectionRepo, AiResultsRepo aiResultsRepo) {
        this.inspectionImageRepo = inspectionImageRepo;
        this.baseImageRepo = baseImageRepo;
        this.localImageService = localImageService;
        this.inspectionRepo = inspectionRepo;
        this.aiResultsRepo = aiResultsRepo;
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

        List<AiResults> aiResults = aiResultsRepo.findAllByInspectionNo(inspectionNo);
        List<Map<String, String>> aiResultsList = aiResults.stream().map(result -> Map.of(
            "faultType", String.valueOf(result.getFaultType()),
            "faultSeverity", String.valueOf(result.getFaultSeverity()),
            "faultConfidence", String.valueOf(result.getFaultConfidence()),
            "XCoordinate", String.valueOf(result.getXCoordinate()),
            "YCoordinate", String.valueOf(result.getYCoordinate()),
            "bbox", String.valueOf(result.getBbox()),
            "areaPx", String.valueOf(result.getAreaPx()),
            "hotspotX", String.valueOf(result.getHotspotX()),
            "hotspotY", String.valueOf(result.getHotspotY())
        )).toList();
            
            images.put("aiResults", aiResultsList);
            log.info("AI Results: {}", images.get("aiResults"));
            return images;
        } catch (Exception e) {
            log.error("Error fetching comparison images: {}", e.getMessage());
            throw new Exception("Error fetching comparison images: " + e.getMessage());
        }
    }

    @Override
    public void addThermalImage(String inspectionNo, String transformerNo, String imageCondition, MultipartFile thermalImage, String uploadedBy, String uploadedDate, String uploadedTime)
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
            Map<String, String> lastUpdatedInfo = new HashMap<>();

            if (inspectionImage != null) {
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
}
