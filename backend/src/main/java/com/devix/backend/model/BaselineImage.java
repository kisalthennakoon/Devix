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
public class BaselineImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String transformerNo;
    private String sunnyImageUrl;
    private String rainyImageUrl;
    private String cloudyImageUrl;
    private String uploadedBy;
    private String uploadedDate;
    private String uploadedTime;
}
