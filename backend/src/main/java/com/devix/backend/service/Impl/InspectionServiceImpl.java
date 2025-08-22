package com.devix.backend.service.Impl;

import com.devix.backend.dto.InspectionRequestDto;
import com.devix.backend.dto.InspectionResponseDto;
import com.devix.backend.model.Inspection;
import com.devix.backend.model.Transformer;
import com.devix.backend.repo.InspectionRepo;
import com.devix.backend.repo.TransformerRepo;
import com.devix.backend.service.GoogleDriveService;
import com.devix.backend.service.InspectionService;
import com.devix.backend.service.MapperService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class InspectionServiceImpl implements InspectionService {

    private final InspectionRepo inspectionRepo;
    private final GoogleDriveService googleDriveService;
    private final TransformerRepo transformerRepo;
    private final MapperService mapperService;

    public InspectionServiceImpl(TransformerRepo transformerRepo, InspectionRepo inspectionRepo, GoogleDriveService googleDriveService) {
        this.googleDriveService = googleDriveService;
        this.transformerRepo = transformerRepo;
        this.inspectionRepo = inspectionRepo;
        this.mapperService = MapperService.INSTANCE;
    }

    @Override
    public void createInspection(InspectionRequestDto inspection) throws Exception {
        try {
            log.info("Creating inspection with details: {}", inspection);
            if(transformerRepo.findByTransformerNo(inspection.getTransformerNo()) == null) {
                throw new Exception("Transformer with number " + inspection.getTransformerNo() + " does not exist.");
            }
            String inspectionNo = generateInspectionNo();
            Inspection newInspection = mapperService.toInspectionEntity(inspection);
            newInspection.setInspectionNo(inspectionNo);
            inspectionRepo.save(newInspection);

        } catch (Exception e) {
            log.error("Error creating inspection: {}", e.getMessage());
            throw new Exception("Error creating inspection: " + e.getMessage());

        }

    }

    @Override
    public void addThermalImage(String inspectionNo, String imageCondition, MultipartFile thermalImage) throws Exception {
        try {
            log.info("Adding thermal image for inspection: {}", inspectionNo);
            Inspection inspection = inspectionRepo.findByInspectionNo(inspectionNo);
            if (inspection == null) {
                throw new Exception("Inspection not found");
            }

            String imageUrl = googleDriveService.uploadFile(thermalImage);
            inspection.setThermalImageUrl(imageUrl);
            inspection.setThermalImageCondition(imageCondition);

            inspectionRepo.save(inspection);
            log.info("Thermal image added successfully");
        } catch (Exception e) {
            log.error("Error adding thermal image: {}", e.getMessage());
            throw new Exception("Error adding thermal image: " + e.getMessage());
        }
    }

    @Override
    public InspectionResponseDto getInspection(String inspectionNo) throws Exception {
        try {
            log.info("Fetching inspection with number: {}", inspectionNo);
            Inspection inspection = inspectionRepo.findByInspectionNo(inspectionNo);
            if (inspection == null) {
                throw new Exception("Inspection not found");
            }
            return mapperService.toInspectionDto(inspection);
        } catch (Exception e) {
            log.error("Error fetching inspection: {}", e.getMessage());
            throw new Exception("Error fetching inspection: " + e.getMessage());
        }
    }

    @Override
    public List<InspectionResponseDto> getAllInspections() throws Exception {
        try {
            log.info("Fetching all inspections");
            List<Inspection> inspections = inspectionRepo.findAll();
            return inspections.stream()
                    .map(mapperService::toInspectionDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching inspections: {}", e.getMessage());
            throw new Exception("Error fetching inspections: " + e.getMessage());
        }
    }

    @Override
    public void updateInspection(String inspectionNo, InspectionRequestDto inspection) throws Exception {
        try {
            log.info("Updating inspection with details: {}", inspection);
            Inspection existingInspection = inspectionRepo.findByInspectionNo(inspectionNo);
            if (existingInspection == null) {
                throw new Exception("Inspection not found");
            }
            Inspection updatedInspection = mapperService.toInspectionEntity(inspection);
            updatedInspection.setId(existingInspection.getId()); // Preserve the ID
            updatedInspection.setInspectionNo(existingInspection.getInspectionNo()); // Preserve the inspection number

            inspectionRepo.save(updatedInspection);
            log.info("Inspection updated successfully");
        } catch (Exception e) {
            log.error("Error updating inspection: {}", e.getMessage());
            throw new Exception("Error updating inspection: " + e.getMessage());
        }
    }

    @Override
    public void deleteInspection(String inspectionNo) throws Exception {
        try {
            log.info("Deleting inspection with number: {}", inspectionNo);
            Inspection inspection = inspectionRepo.findByInspectionNo(inspectionNo);
            if (inspection == null) {
                throw new Exception("Inspection not found");
            }
            inspectionRepo.delete(inspection);
            log.info("Inspection deleted successfully");
        } catch (Exception e) {
            log.error("Error deleting inspection: {}", e.getMessage());
            throw new Exception("Error deleting inspection: " + e.getMessage());
        }

    }

    @Override
    public Map<String, String> getComparisonImage(String inspectionNo) throws Exception {
        try {
            log.info("Fetching comparison images for inspection: {}", inspectionNo);
            Inspection inspection = inspectionRepo.findByInspectionNo(inspectionNo);
            if (inspection == null) {
                throw new Exception("Inspection not found");
            }
            Map<String, String> images = new java.util.HashMap<>();

            Transformer transformer = transformerRepo.findByTransformerNo(inspection.getTransformerNo());

            switch (inspection.getThermalImageCondition()) {
                case "Sunny" -> {
                    images.put("baseImageUrl", transformer.getBaseImageSunnyUrl());
                    images.put("thermal", inspection.getThermalImageUrl());
                }
                case "Cloudy" -> {
                    images.put("baseImageUrl", transformer.getBaseImageCloudyUrl());
                    images.put("thermal", inspection.getThermalImageUrl());
                }
                case "Rainy" -> {
                    images.put("baseImageUrl", transformer.getBaseImageRainyUrl());
                    images.put("thermal", inspection.getThermalImageUrl());
                }
            }
            return images;
        } catch (Exception e) {
            log.error("Error fetching comparison images: {}", e.getMessage());
            throw new Exception("Error fetching comparison images: " + e.getMessage());
        }
    }

    private String generateInspectionNo() {
        Integer maxInspectionNo = inspectionRepo.findMaxInspectionNo();
        if (maxInspectionNo == null) {
            maxInspectionNo = 0;
        }
        return String.format("%05d", maxInspectionNo + 1);

    }

    @Override
    public List<InspectionResponseDto> getInspectionsByTransformerNo(String transformerNo) throws Exception {
        try {
            log.info("Fetching inspections for transformer number: {}", transformerNo);
            List<Inspection> inspections = inspectionRepo.findByTransformerNo(transformerNo);
            return inspections.stream()
                    .map(mapperService::toInspectionDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching inspections by TransformerNo: {}", e.getMessage());
            throw new Exception("Error fetching inspections: " + e.getMessage());
        }
    }
}
