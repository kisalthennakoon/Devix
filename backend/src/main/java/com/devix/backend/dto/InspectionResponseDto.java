package com.devix.backend.dto;

import lombok.Data;

@Data
public class InspectionResponseDto {

    private String inspectionNo;
    private String inspectionDate;
    private String inspectionTime;
    private String inspectionBranch;
    private String transformerNo;
    private String inspectionStatus;
    private String inspectedby;

}
