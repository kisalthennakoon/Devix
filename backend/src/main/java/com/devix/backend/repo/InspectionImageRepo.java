package com.devix.backend.repo;

import com.devix.backend.model.InspectionImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InspectionImageRepo extends JpaRepository<InspectionImage, Long> {
    InspectionImage findByInspectionNo(String inspectionNo);
    List<InspectionImage> findByTransformerNo(String transformerNo);
    void deleteAllByTransformerNo(String transformerNo);
}
