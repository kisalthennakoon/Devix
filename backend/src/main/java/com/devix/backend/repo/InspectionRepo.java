package com.devix.backend.repo;

import com.devix.backend.model.Inspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InspectionRepo extends JpaRepository<Inspection, Long> {
}
