package com.devix.backend.repo;

import com.devix.backend.model.BaselineImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BaseImageRepo extends JpaRepository<BaselineImage, Long>{
    BaselineImage findByTransformerNo(String transformerNo);
    void deleteByTransformerNo(String transformerNo);
}
