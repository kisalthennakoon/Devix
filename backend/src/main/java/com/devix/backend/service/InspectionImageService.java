package com.devix.backend.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface InspectionImageService {
    void addThermalImage(String inspectionNo, String transformerNo, String imageCondition, MultipartFile thermalImage, String uploadedBy, String uploadedDate, String uploadedTime) throws Exception;
    Map<String, Object> getComparisonImage(String inspectionNo) throws Exception;
    Map<String , String> getLastUpdatedDate(String inspectionNo) throws Exception;
    void createEvalResults(List<Map<String, String>> evalResultsList) throws Exception;
    Map<String, Object> getReport(String inspectionNo) throws Exception;
}
