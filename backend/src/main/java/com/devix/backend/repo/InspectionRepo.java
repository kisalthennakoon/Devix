package com.devix.backend.repo;

import com.devix.backend.model.Inspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InspectionRepo extends JpaRepository<Inspection, Long> {

    @Query("SELECT MAX(CAST(i.inspectionNo AS int)) FROM Inspection i")
    Integer findMaxInspectionNo();

    Inspection findByInspectionNo(String inspectionNo);
    List<Inspection> findByTransformerNo(String transformerNo);
    void deleteAllByTransformerNo(String transformerNo);
}
