package com.devix.backend.service.Impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.Base64;
import java.util.Objects;
import java.util.UUID;

@Service
@Slf4j
public class LocalImageService {

    @Value("${image.upload.dir}")
    private String uploadDir;

    public String uploadImage(MultipartFile file) {
        try {
            // Ensure directory exists
            Files.createDirectories(Paths.get(uploadDir));

            // Get extension
            String originalName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
            String extension = "";
            if (originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }

            // Generate unique file name
            String uniqueName = UUID.randomUUID().toString() + extension;
            Path filePath = Paths.get(uploadDir, uniqueName);

            // Save file locally
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return filePath.toString();

        } catch (IOException e) {
            log.error("Error uploading image: {}", e.getMessage(), e);
            throw new RuntimeException("Could not upload the file: " + e.getMessage());

        }
    }


    public String getImage(String path) {
        try {
            File file = new File(path);
            if (!file.exists()) {
                return null;
            }

            Resource resFile = new FileSystemResource(file);
            byte[] bytes = resFile.getInputStream().readAllBytes();
            return Base64.getEncoder().encodeToString(bytes);

        } catch (Exception e) {
            log.error("Error retrieving image: {}", e.getMessage(), e);
            throw new RuntimeException("Could not retrieve the file: " + e.getMessage());
        }
    }


}

