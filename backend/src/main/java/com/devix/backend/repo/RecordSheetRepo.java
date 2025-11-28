package com.devix.backend.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devix.backend.model.Inspection;
import com.devix.backend.model.RecordSheet;
import com.devix.backend.model.Transformer;

public interface RecordSheetRepo extends JpaRepository<RecordSheet, Long> {
    RecordSheet findByTransformer(Transformer transformer);
    RecordSheet findByInspection(Inspection inspection);
    
}
