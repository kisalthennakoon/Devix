package com.devix.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
public class RecordSheet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "transformer_id")
    private Transformer transformer;

    @OneToOne
    @JoinColumn(name = "inspection_id")
    private Inspection inspection;

    // --- (9.6.0) Top Section ---
    private String lastMonthKva;      // Input: IR 02052
    
    @Column(name = "inspection_date")
    private LocalDate inspectionDate; // Input: Mon(21), May, 2023
    
    @Column(name = "inspection_time")
    private LocalTime inspectionTime; // Input: 12.05am
    
    private String currentMonthKva;   // Input: IR 02052
    private String baseLineCondition; // Dropdown: Sunny
    private String transformerType;   // Dropdown: Bulk

    // --- Meter Details ---
    private String meterSerial;       // Input: 20400594
    private String meterCtRatio;      // Input: 300 (Stored as String to allow "/5A")
    private String meterMake;         // Dropdown: Miscrostar

    // --- First Inspection Readings (Voltage & Current) ---
    private Double firstVoltR;
    private Double firstVoltY;
    private Double firstVoltB;
    
    private Double firstAmpsR;
    private Double firstAmpsY;
    private Double firstAmpsB;

    // --- Second Inspection Readings (Voltage & Current) ---
    private Double secondVoltR;
    private Double secondVoltY;
    private Double secondVoltB;
    
    private Double secondAmpsR;
    private Double secondAmpsY;
    private Double secondAmpsB;

    // --- After Inspection Footer ---
    private LocalDate afterThermalDate; // Bottom right date
    private LocalTime afterThermalTime; // Bottom right time

    // --- Work Content & Report Grid ---
    // Since this is a list of rows (1-4) containing checkboxes, 
    // it is best stored as a separate child entity.
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "record_sheet_id")
    private List<WorkContentRow> workContentRows;
}