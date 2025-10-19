package com.devix.backend.repo;

import com.devix.backend.model.EvalResults;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EvalResultsRepo extends JpaRepository<EvalResults, Long> {

    EvalResults findByInspectionNo(String inspectionNo);
    List<EvalResults> findAllByInspectionNo(String inspectionNo);
    void deleteAllByTransformerNo(String transformerNo);
}
