package com.devix.backend.service.Impl;

import com.devix.backend.dto.TransformerDto;
import com.devix.backend.model.Transformer;
import com.devix.backend.repo.TransformerRepo;
import com.devix.backend.service.GoogleDriveService;
import com.devix.backend.service.MapperService;
import com.devix.backend.service.TransformerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@Slf4j
public class TransformerServiceImpl implements TransformerService {

    @Autowired
    private TransformerRepo transformerRepo;

    @Autowired
    private GoogleDriveService googleDriveService;

    private final MapperService mapperService = MapperService.INSTANCE;

    @Override
    public void createTransformer(TransformerDto transformerDto) throws Exception {

        try {
            log.info("Creating transformer with details: {}", transformerDto);

            if (transformerRepo.findByTransformerNo(transformerDto.getTransformerNo()) != null) {
                throw new Exception("Transformer with this number already exists");
            }

            transformerRepo.save(mapperService.toTransformerEntity(transformerDto));
            log.info("Transformer created");
        }catch (Exception e) {
            log.error("Error creating transformer: {}", e.getMessage());
            throw new Exception("Error creating transformer: " + e.getMessage());
        }
    }

    @Override
    public void addBaseImage(String transformerNo, MultipartFile baseImage) throws Exception {
        try {
            log.info("Adding base image for transformer: {}", transformerNo);
            Transformer transformer = transformerRepo.findByTransformerNo(transformerNo);
            if (transformer == null) {
                throw new Exception("Transformer not found");
            }
            //MultipartFile multipartFile = transformerDto.getTransformerBaseImage();
//            java.io.File tempFile = java.io.File.createTempFile("upload-", baseImage.getOriginalFilename());
//            baseImage.transferTo(tempFile);

            String imageUrl = googleDriveService.uploadFile(baseImage);
            transformer.setTransformerBaseImageUrl(imageUrl);
            transformerRepo.save(transformer);
            log.info("Base image added successfully");
        } catch (Exception e) {
            log.error("Error adding base image: {}", e.getMessage());
            throw new Exception("Error adding base image: " + e.getMessage());
        }
    }

    @Override
    public TransformerDto getTransformer(String transformerNo) throws Exception {
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
    public List<Transformer> getAllTransformers() throws Exception {
        try {
            log.info("Fetching all transformers");
            return transformerRepo.findAll();
        } catch (Exception e) {
            log.error("Error fetching all transformers: {}", e.getMessage());
            throw new Exception("Error fetching all transformers: " + e.getMessage());
        }
    }

    @Override
    public void updateTransformer(TransformerDto transformerDto) throws Exception {
        try {
            log.info("Updating transformer with details: {}", transformerDto);
            Transformer existingTransformer = transformerRepo.findByTransformerNo(transformerDto.getTransformerNo());
            if (existingTransformer == null) {
                throw new Exception("Transformer not found");
            }
            transformerRepo.save(mapperService.toTransformerEntity(transformerDto));
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


}
