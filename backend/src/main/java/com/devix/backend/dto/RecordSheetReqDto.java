package com.devix.backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class RecordSheetReqDto {

    private String inspectorName;
    private String inspectorStatusOfTransformer;
    private String inspectorElectricalReadingsVoltage;
    private String inspectorElectricalReadingsCurrent;
    private String inspectorRecommendations;
    private String inspectorRemarks;

    private String rectifierName;
    private String rectifierStatusOfTransformer;
    private String rectifierElectricalReadingsVoltage;
    private String rectifierElectricalReadingsCurrent;
    private String rectifierRecommendations;
    private String rectifierRemarks;

    private String reInspectorName;
    private String reInspectorStatusOfTransformer;
    private String reInspectorElectricalReadingsVoltage;
    private String reInspectorElectricalReadingsCurrent;
    private String reInspectorRecommendations;
    private String reInspectorRemarks;

    // // --- (9.6.0) Top Section ---
    // private String lastMonthKva;
    // private String currentMonthKva;
    
    // // Standard ISO format expected (YYYY-MM-DD)
    // private LocalDate inspectionDate; 
    // // Standard ISO format expected (HH:mm)
    // private LocalTime inspectionTime; 
    
    // private String baseLineCondition;
    // private String transformerType;

    // // --- Meter Details ---
    // private String meterSerial;
    // private String meterCtRatio;
    // private String meterMake;

    // // --- First Inspection Readings ---
    // private Double firstVoltR;
    // private Double firstVoltY;
    // private Double firstVoltB;
    
    // private Double firstAmpsR;
    // private Double firstAmpsY;
    // private Double firstAmpsB;

    // // --- Second Inspection Readings ---
    // private Double secondVoltR;
    // private Double secondVoltY;
    // private Double secondVoltB;
    
    // private Double secondAmpsR;
    // private Double secondAmpsY;
    // private Double secondAmpsB;

    // // --- After Inspection Footer ---
    // private LocalDate afterThermalDate;
    // private LocalTime afterThermalTime;

    // // --- Work Content Grid (The List of Rows) ---
    // private List<WorkContentRowDto> workContentRows;
}
