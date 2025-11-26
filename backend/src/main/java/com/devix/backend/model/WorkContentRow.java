package com.devix.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class WorkContentRow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer rowNumber; // 1, 2, 3, or 4

    // Left Side: Work Content
    private Boolean isCheck;    // C
    private Boolean isClean;    // Cl
    private Boolean isTight;    // T
    private Boolean isReplace;  // R
    private String otherNotes;  // Other

    // Right Side: After Inspection Report
    private Boolean isOk;       // OK
    private Boolean isNotOk;    // NOT OK
    private String irNumber;    // IR No(s)
}
