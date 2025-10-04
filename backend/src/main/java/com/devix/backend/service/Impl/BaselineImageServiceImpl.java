package com.devix.backend.service.Impl;

import com.devix.backend.model.BaselineImage;
import com.devix.backend.repo.BaseImageRepo;
import com.devix.backend.service.BaselineImageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@Slf4j
public class BaselineImageServiceImpl implements BaselineImageService {

    private final BaseImageRepo baseImageRepo;
//    private final GoogleDriveService googleDriveService;
    private final LocalImageService localImageService;

    public BaselineImageServiceImpl (BaseImageRepo baseImageRepo, LocalImageService localImageService) {
        this.baseImageRepo = baseImageRepo;
        this.localImageService = localImageService;
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

            String sunnyImageUrl = localImageService.uploadImage(baseImageSunny);
            log.info("sunnyImageUrl: {}", sunnyImageUrl);
            String cloudyImageUrl = localImageService.uploadImage(baseImageCloudy);
            log.info("cloudyImageUrl: {}", cloudyImageUrl);
            String rainyImageUrl = localImageService.uploadImage(baseImageRainy);
            log.info("rainyImageUrl: {}", rainyImageUrl);

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
    public Map<String, Object> getBaseImage(String transformerNo) throws Exception {
        try {
            log.info("Fetching base image for transformer: {}", transformerNo);
            BaselineImage baselineImage = baseImageRepo.findByTransformerNo(transformerNo);
            if (baselineImage == null) {
                throw new Exception("Baseline image not found");
            }
            return Map.of(
                    "sunny", localImageService.getImage(baselineImage.getSunnyImageUrl()),
                    "cloudy", localImageService.getImage(baselineImage.getCloudyImageUrl()),
                    "rainy", localImageService.getImage(baselineImage.getRainyImageUrl())
            );
        } catch (Exception e) {
            log.error("Error fetching base image: {}", e.getMessage());
            throw new Exception("Error fetching base image: " + e.getMessage());
        }
    }
}
