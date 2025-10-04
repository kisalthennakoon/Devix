package com.devix.backend.repo;

import com.devix.backend.model.AiResults;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AiResultsRepo extends JpaRepository<AiResults, Long> {

    AiResults findByInspectionNo(String inspectionNo);
    List<AiResults> findAllByInspectionNo(String inspectionNo);
}
