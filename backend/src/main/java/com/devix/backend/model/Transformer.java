package com.devix.backend.model;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class Transformer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String transformerNo;
    private String transformerType;
    private String transformerPoleNo;
    private String transformerRegion;
    private String transformerLocation;
    private String transformerBaseImageUrl;
}
