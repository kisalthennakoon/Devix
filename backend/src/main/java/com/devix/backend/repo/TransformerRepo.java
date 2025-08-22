package com.devix.backend.repo;

import com.devix.backend.model.Transformer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransformerRepo extends JpaRepository<Transformer, Long> {

    //getTransformer by transformerNo
    Transformer findByTransformerNo(String transformerNo);
}
