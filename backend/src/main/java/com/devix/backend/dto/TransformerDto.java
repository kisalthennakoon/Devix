package com.devix.backend.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class TransformerDto {

    private String transformerNo;
    private String transformerType;
    private String transformerPoleNo;
    private String transformerRegion;
    private String transformerLocation;

    private String transformerBaseImageUrl;

}
