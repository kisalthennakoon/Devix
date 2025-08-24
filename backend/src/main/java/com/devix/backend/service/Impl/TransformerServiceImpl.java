package com.devix.backend.service.Impl;

import com.devix.backend.dto.TransformerRequestDto;
import com.devix.backend.dto.TransformerResponseDto;
import com.devix.backend.model.Transformer;
import com.devix.backend.repo.TransformerRepo;
import com.devix.backend.service.GoogleDriveService;
import com.devix.backend.service.MapperService;
import com.devix.backend.service.TransformerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class TransformerServiceImpl implements TransformerService {

    private final TransformerRepo transformerRepo;
    private final GoogleDriveService googleDriveService;
    private final MapperService mapperService;

    public TransformerServiceImpl(TransformerRepo transformerRepo, GoogleDriveService googleDriveService) {
        this.transformerRepo = transformerRepo;
        this.googleDriveService = googleDriveService;
        this.mapperService = MapperService.INSTANCE;
    }

    @Override
    public void createTransformer(TransformerRequestDto transformerRequestDto) throws Exception {

        try {
            log.info("Creating transformer with details: {}", transformerRequestDto);

            if (transformerRepo.findByTransformerNo(transformerRequestDto.getTransformerNo()) != null) {
                throw new Exception("Transformer with this number already exists");
            }

            transformerRepo.save(mapperService.toTransformerEntity(transformerRequestDto));
            log.info("Transformer created");
        }catch (Exception e) {
            log.error("Error creating transformer: {}", e.getMessage());
            throw new Exception("Error creating transformer: " + e.getMessage());
        }
    }

    @Override
    public void addBaseImage(String transformerNo, MultipartFile baseImageSunny, MultipartFile baseImageCloudy, MultipartFile baseImageRainy) throws Exception {
        try {
            log.info("Adding base image for transformer: {}", transformerNo);
            Transformer transformer = transformerRepo.findByTransformerNo(transformerNo);
            if (transformer == null) {
                throw new Exception("Transformer not found");
            }

            String sunnyImageUrl = googleDriveService.uploadFile(baseImageSunny);
            String cloudyImageUrl = googleDriveService.uploadFile(baseImageCloudy);
            String rainyImageUrl = googleDriveService.uploadFile(baseImageRainy);

            transformer.setBaseImageSunnyUrl(sunnyImageUrl);
            transformer.setBaseImageCloudyUrl(cloudyImageUrl);
            transformer.setBaseImageRainyUrl(rainyImageUrl);

            transformerRepo.save(transformer);
            log.info("Base image added successfully");
        } catch (Exception e) {
            log.error("Error adding base image: {}", e.getMessage());
            throw new Exception("Error adding base image: " + e.getMessage());
        }
    }

    @Override
    public TransformerResponseDto getTransformer(String transformerNo) throws Exception {
        try {
            log.info("Fetching transformer with number: {}", transformerNo);
            Transformer transformer = transformerRepo.findByTransformerNo(transformerNo);
            if (transformer == null) {
                throw new Exception("Transformer not found");
            }
            return mapperService.toTransformerDto(transformer);
        } catch (Exception e) {
            log.error("Error fetching transformer: {}", e.getMessage());
            throw new Exception("Error fetching transformer: " + e.getMessage());
        }
    }

    @Override
    public List<TransformerResponseDto> getAllTransformers() throws Exception {
        try {
            log.info("Fetching all transformers");
            List<Transformer> transformers = transformerRepo.findAll();
            return transformers.stream()
                    .map(mapperService::toTransformerDto)
                    .toList();

        } catch (Exception e) {
            log.error("Error fetching all transformers: {}", e.getMessage());
            throw new Exception("Error fetching all transformers: " + e.getMessage());
        }
    }

    @Override
    public void updateTransformer(TransformerRequestDto transformerRequestDto) throws Exception {
        try {
            log.info("Updating transformer with details: {}", transformerRequestDto);
            Transformer existingTransformer = transformerRepo.findByTransformerNo(transformerRequestDto.getTransformerNo());
            if (existingTransformer == null) {
                throw new Exception("Transformer not found");
            }
            transformerRepo.save(mapperService.toTransformerEntity(transformerRequestDto));
            log.info("Transformer updated");
        } catch (Exception e) {
            log.error("Error updating transformer: {}", e.getMessage());
            throw new Exception("Error updating transformer: " + e.getMessage());
        }
    }

    @Override
    public void deleteTransformer(String transformerNo) throws Exception {
        try {
            log.info("Deleting transformer with number: {}", transformerNo);
            Transformer existingTransformer = transformerRepo.findByTransformerNo(transformerNo);
            if (existingTransformer == null) {
                throw new Exception("Transformer not found");
            }
            transformerRepo.delete(existingTransformer);
            log.info("Transformer deleted");
        } catch (Exception e) {
            log.error("Error deleting transformer: {}", e.getMessage());
            throw new Exception("Error deleting transformer: " + e.getMessage());
        }
    }

    @Override
    public Map<String, String> getBaseImage(String transformerNo) throws Exception {
        try {
            log.info("Fetching base image for transformer: {}", transformerNo);
            Transformer transformer = transformerRepo.findByTransformerNo(transformerNo);
            if (transformer == null) {
                throw new Exception("Transformer not found");
            }
            return Map.of(
                    "sunny", transformer.getBaseImageSunnyUrl(),
                    "cloudy", transformer.getBaseImageCloudyUrl(),
                    "rainy", transformer.getBaseImageRainyUrl()
            );
        } catch (Exception e) {
            log.error("Error fetching base image: {}", e.getMessage());
            throw new Exception("Error fetching base image: " + e.getMessage());
        }
    }
    @Override
    public void deleteBaseImage(String transformerNo) throws Exception {
        try{
            log.info("Deleting base image for transformer: {}", transformerNo);
            Transformer transformer = transformerRepo.findByTransformerNo(transformerNo);
            if (transformer == null) {
                throw new Exception("Transformer not found");
            }
            transformer.setBaseImageSunnyUrl(null);
            transformer.setBaseImageCloudyUrl(null);
            transformer.setBaseImageRainyUrl(null);
            transformerRepo.save(transformer);
            log.info("Base image deleted successfully");
        }catch (Exception e){
            log.error("Error deleting base image: {}", e.getMessage());
            throw new Exception("Error deleting base image: " + e.getMessage());

        }
    }


}
