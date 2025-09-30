package com.devix.backend.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

public interface BaselineImageService {

    void addBaseImage(String transformerNo, MultipartFile baseImageSunny, MultipartFile baseImageCloudy, MultipartFile baseImageRainy, String uploadedBy, String uploadedDate, String uploadedTime ) throws Exception;
    Map<String, Object> getBaseImage(String transformerNo) throws Exception;
    void deleteBaseImage(String transformerNo) throws Exception;
    
}
