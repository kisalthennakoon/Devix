package com.devix.backend.service.Impl;

import com.devix.backend.model.BaselineImage;
import com.devix.backend.model.Transformer;
import com.devix.backend.repo.BaseImageRepo;
import com.devix.backend.service.BaselineImageService;
import com.devix.backend.service.GoogleDriveService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@Slf4j
public class BaselineImageServiceImpl implements BaselineImageService {

    private final BaseImageRepo baseImageRepo;
    private final GoogleDriveService googleDriveService;

    public BaselineImageServiceImpl (BaseImageRepo baseImageRepo, GoogleDriveService googleDriveService) {
        this.baseImageRepo = baseImageRepo;
        this.googleDriveService = googleDriveService;
    }

    @Override
    public void addBaseImage(String transformerNo, MultipartFile baseImageSunny, MultipartFile baseImageCloudy, MultipartFile baseImageRainy, String uploadedBy, String uploadedDate, String uploadedTime) throws Exception {
        try {
            log.info("Adding base image for transformer: {}", transformerNo);
            BaselineImage baselineImage = new BaselineImage();

            if (baseImageRepo.findByTransformerNo(transformerNo) != null) {
                baselineImage = baseImageRepo.findByTransformerNo(transformerNo);
            }else{
                baselineImage.setTransformerNo(transformerNo);
            }

            String sunnyImageUrl = googleDriveService.uploadFile(baseImageSunny);
            String cloudyImageUrl = googleDriveService.uploadFile(baseImageCloudy);
            String rainyImageUrl = googleDriveService.uploadFile(baseImageRainy);

            baselineImage.setSunnyImageUrl(sunnyImageUrl);
            baselineImage.setCloudyImageUrl(cloudyImageUrl);
            baselineImage.setRainyImageUrl(rainyImageUrl);
            baselineImage.setUploadedBy(uploadedBy);
            baselineImage.setUploadedDate(uploadedDate);
            baselineImage.setUploadedTime(uploadedTime);

            baseImageRepo.save(baselineImage);
            log.info("Base image added successfully");
        } catch (Exception e) {
            log.error("Error adding base image: {}", e.getMessage());
            throw new Exception("Error adding base image: " + e.getMessage());
        }
    }

    @Override
    public void deleteBaseImage(String transformerNo) throws Exception {
        try{
            log.info("Deleting base image for transformer: {}", transformerNo);
            BaselineImage baselineImage = baseImageRepo.findByTransformerNo(transformerNo);
            if (baselineImage == null) {
                throw new Exception("Baseline image not found");
            }
            baseImageRepo.delete(baselineImage);

        }catch (Exception e){
            log.error("Error deleting base image: {}", e.getMessage());
            throw new Exception("Error deleting base image: " + e.getMessage());

        }
    }

    @Override
    public Map<String, String> getBaseImage(String transformerNo) throws Exception {
        try {
            log.info("Fetching base image for transformer: {}", transformerNo);
            BaselineImage baselineImage = baseImageRepo.findByTransformerNo(transformerNo);
            if (baselineImage == null) {
                throw new Exception("Baseline image not found");
            }
            return Map.of(
                    "sunny", baselineImage.getSunnyImageUrl(),
                    "cloudy", baselineImage.getCloudyImageUrl(),
                    "rainy", baselineImage.getRainyImageUrl()
            );
        } catch (Exception e) {
            log.error("Error fetching base image: {}", e.getMessage());
            throw new Exception("Error fetching base image: " + e.getMessage());
        }
    }
}
