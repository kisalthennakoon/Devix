package com.devix.backend.dto;

import lombok.Data;

@Data
public class InspectionDto {

    private String inspectionDate;
    private String inspectionTime;
    private String inspectionBranch;
    private String inspectionStatus;
    private String inspectionImage;
    private String transformerNo;

}
