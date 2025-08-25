package com.devix.backend.service;

import com.devix.backend.dto.TransformerRequestDto;
import com.devix.backend.dto.TransformerResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface TransformerService {

    //CRUD operations for Transformer

    void createTransformer(TransformerRequestDto transformer) throws Exception;

    TransformerResponseDto getTransformer(String transformerNo) throws Exception;
    List<TransformerResponseDto> getAllTransformers() throws Exception;
    void updateTransformer(TransformerRequestDto transformer) throws Exception;
    void deleteTransformer(String transformerNo) throws Exception;
    Map<String, String> lastInspectedDate(String transformerNo) throws Exception;


}
