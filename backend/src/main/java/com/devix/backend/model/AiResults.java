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
public class AiResults {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String inspectionNo;
    private String anomalyStatus;
    private String faultType;
    private String faultSeverity;
    private String faultConfidence;
    private String XCoordinate;
    private String YCoordinate;

    // New fields for bbox, area_px, hotspot_x, hotspot_y
    private String bbox; // Store as JSON string
    private String areaPx;
    private String hotspotX;
    private String hotspotY;
}
