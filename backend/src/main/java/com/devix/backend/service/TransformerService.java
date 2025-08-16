package com.devix.backend.service;

import com.devix.backend.dto.TransformerDto;
import com.devix.backend.model.Transformer;

import java.util.List;

public interface TransformerService {

    //CRUD operations for Transformer

    void createTransformer(TransformerDto transformer) throws Exception;
    TransformerDto getTransformer(String transformerNo) throws Exception;
    List<Transformer> getAllTransformers() throws Exception;
    void updateTransformer(TransformerDto transformer) throws Exception;
    void deleteTransformer(String transformerNo) throws Exception;

}
