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
public class Inspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String inspectionNo;
    private String inspectionDate;
    private String inspectionTime;
    private String inspectionBranch;
    private String inspectionStatus;
    private String transformerNo;
    private String inspectedby;

    public Inspection(String inspectionNo, String inspectionDate, String inspectionTime, String inspectionBranch, String inspectionStatus, String transformerNo, String inspectedby) {
        this.inspectionNo = inspectionNo;
        this.inspectionDate = inspectionDate;
        this.inspectionTime = inspectionTime;
        this.inspectionBranch = inspectionBranch;
        this.inspectionStatus = inspectionStatus;
        this.transformerNo = transformerNo;
        this.inspectedby = inspectedby;
    }
}
