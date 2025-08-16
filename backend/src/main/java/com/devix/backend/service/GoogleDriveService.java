package com.devix.backend.service;

import com.devix.backend.Config.GoogleDriveConfig;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.client.http.FileContent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;

@Service
public class GoogleDriveService {

    @Autowired
    private Drive drive;

    public String uploadFile(MultipartFile multipartFile) throws IOException {
        // Convert MultipartFile → temp file
        Path tempPath = Files.createTempFile("upload-", multipartFile.getOriginalFilename());
        multipartFile.transferTo(tempPath.toFile());

        File fileMetadata = new File();
        fileMetadata.setName(multipartFile.getOriginalFilename());
        fileMetadata.setParents(Collections.singletonList("1vqznBcI_7Lp9FGx_0j79_5KVlOMP5nqY"));

        FileContent mediaContent = new FileContent(multipartFile.getContentType(), tempPath.toFile());
        File uploadedFile = drive.files().create(fileMetadata, mediaContent)
                .setFields("id, webViewLink, webContentLink")
                .execute();

        // Delete temp file
        Files.delete(tempPath);

        return uploadedFile.getWebViewLink();
    }
}
