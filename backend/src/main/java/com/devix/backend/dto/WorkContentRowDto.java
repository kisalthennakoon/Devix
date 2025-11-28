package com.devix.backend.dto;

import lombok.Data;

@Data
public class WorkContentRowDto {
    private Integer rowNumber; 

    // Left Side: Work Content
    private Boolean isCheck;
    private Boolean isClean;
    private Boolean isTight;
    private Boolean isReplace;
    private String otherNotes;

    // Right Side: After Inspection Report
    private Boolean isOk;
    private Boolean isNotOk;
    private String irNumber;
}
