package com.devix.backend.model;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
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
    private String transformerCapacity;

    public Transformer(String transformerNo, String transformerType, String transformerPoleNo, String transformerRegion, String transformerLocation, String transformerCapacity) {
    this.transformerNo = transformerNo;
    this.transformerType = transformerType;
    this.transformerPoleNo = transformerPoleNo;
    this.transformerRegion = transformerRegion;
    this.transformerLocation = transformerLocation;
    this.transformerCapacity = transformerCapacity;
}

}
