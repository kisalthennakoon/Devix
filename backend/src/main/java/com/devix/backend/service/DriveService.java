package com.devix.backend.service;

import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.Permission;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
public class DriveService {

    @Autowired
    private Drive driveService;

    public String uploadFile(java.io.File filePath) throws IOException {

        File fileMetadata = new File();
        fileMetadata.setName(filePath.getName());

        File uploadedFile = driveService.files().create(fileMetadata,
                        new com.google.api.client.http.FileContent("image/jpeg", filePath))
                .setFields("id")
                .execute();

        // Make file public
        Permission permission = new Permission()
                .setRole("reader")
                .setType("anyone");
        driveService.permissions().create(uploadedFile.getId(), permission).execute();

        // Return public link
        return "https://drive.google.com/uc?id=" + uploadedFile.getId();
    }
}

