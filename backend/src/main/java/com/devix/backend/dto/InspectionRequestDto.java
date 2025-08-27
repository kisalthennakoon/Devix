package com.devix.backend.dto;

import lombok.Data;

@Data
public class InspectionRequestDto {

    private String inspectionDate;
    private String inspectionTime;
    private String inspectionBranch;
    private String transformerNo;
    private String inspectedby;

}
