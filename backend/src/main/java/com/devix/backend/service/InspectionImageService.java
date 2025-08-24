package com.devix.backend.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

public interface InspectionImageService {
    void addThermalImage(String inspectionNo, String transformerNo, String imageCondition, MultipartFile thermalImage, String uploadedBy, String uploadedDate, String uploadedTime) throws Exception;
    Map<String, String> getComparisonImage(String inspectionNo) throws Exception;
}
