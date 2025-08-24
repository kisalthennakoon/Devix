package com.devix.backend.service.Impl;

import com.devix.backend.model.BaselineImage;
import com.devix.backend.model.Inspection;
import com.devix.backend.model.InspectionImage;
import com.devix.backend.model.Transformer;
import com.devix.backend.repo.BaseImageRepo;
import com.devix.backend.repo.InspectionImageRepo;
import com.devix.backend.repo.InspectionRepo;
import com.devix.backend.service.GoogleDriveService;
import com.devix.backend.service.InspectionImageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class InspectionImageServiceImpl implements InspectionImageService {

    private final InspectionImageRepo inspectionImageRepo;
    private final BaseImageRepo baseImageRepo;
    private final GoogleDriveService googleDriveService;
    private final InspectionRepo inspectionRepo;

    public InspectionImageServiceImpl(InspectionImageRepo inspectionImageRepo, BaseImageRepo baseImageRepo,
            GoogleDriveService googleDriveService, InspectionRepo inspectionRepo) {
        this.inspectionImageRepo = inspectionImageRepo;
        this.baseImageRepo = baseImageRepo;
        this.googleDriveService = googleDriveService;
        this.inspectionRepo = inspectionRepo;
    }

    @Override
    public Map<String, String> getComparisonImage(String inspectionNo) throws Exception {
        try {
            log.info("Fetching comparison images for inspection: {}", inspectionNo);

            InspectionImage inspectionImage = inspectionImageRepo.findByInspectionNo(inspectionNo);
            Inspection inspection = inspectionRepo.findByInspectionNo(inspectionNo);

            Map<String, String> images = new HashMap<>();
            BaselineImage baselineImage = baseImageRepo.findByTransformerNo(inspection.getTransformerNo());

            String baseImageUrl = null;
            String inspectionImageUrl = null;
            // Always handle thermal image safely
            if (inspectionImage != null) {
                inspectionImageUrl = (inspectionImage.getThermalImageUrl() != null
                        && !inspectionImage.getThermalImageUrl().isEmpty())
                        ? inspectionImage.getThermalImageUrl()
                        : null;
            }
            //String baseImageUrl = (baselineImage.getSunnyImageUrl() != null) ? "exist" : null;

            if (baselineImage != null && inspectionImage.getThermalImageCondition() != null) {
                switch (inspectionImage.getThermalImageCondition()) {
                    case "Sunny" -> baseImageUrl = (baselineImage.getSunnyImageUrl() != null
                            && !baselineImage.getSunnyImageUrl().isEmpty())
                            ? baselineImage.getSunnyImageUrl()
                            : null;

                    case "Cloudy" -> baseImageUrl = (baselineImage.getCloudyImageUrl() != null
                            && !baselineImage.getCloudyImageUrl().isEmpty())
                            ? baselineImage.getCloudyImageUrl()
                            : null;

                    case "Rainy" -> baseImageUrl = (baselineImage.getRainyImageUrl() != null
                            && baselineImage.getRainyImageUrl() .isEmpty())
                            ? baselineImage.getRainyImageUrl()
                            : null;


                }
            }

            images.put("baseImageUrl", baseImageUrl);
            images.put("thermal", inspectionImageUrl);

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
            String imageUrl = googleDriveService.uploadFile(thermalImage);
            inspectionImage.setThermalImageUrl(imageUrl);
            inspectionImage.setThermalImageCondition(imageCondition);
            inspectionImage.setUploadedBy(uploadedBy);
            inspectionImage.setUploadedDate(uploadedDate);
            inspectionImage.setUploadedTime(uploadedTime);

            inspectionImageRepo.save(inspectionImage);
            log.info("Thermal image added successfully");
        } catch (Exception e) {
            log.error("Error adding thermal image: {}", e.getMessage());
            throw new Exception("Error adding thermal image: " + e.getMessage());
        }
    }
}
