package com.devix.backend.service;

import com.devix.backend.dto.InspectionRequestDto;
import com.devix.backend.dto.InspectionResponseDto;
import com.devix.backend.dto.RecordSheetReqDto;
import com.devix.backend.model.RecordSheet;

import java.util.List;
import java.util.Map;

public interface InspectionService {

    void createInspection(InspectionRequestDto inspection) throws Exception;

    InspectionResponseDto getInspection(String inspectionNo) throws Exception;
    List<InspectionResponseDto> getAllInspections() throws Exception;
    void updateInspection(String inspectionNo, InspectionRequestDto inspection) throws Exception;
    void deleteInspection(String inspectionNo) throws Exception;
    List<InspectionResponseDto> getInspectionsByTransformerNo(String transformerNo) throws Exception;
    Map<String, String> inspectionStatus(String inspectionNo) throws Exception;
    RecordSheet getRecordSheetByInspectionNo(String inspectionNo) throws Exception;
    void updateRecordSheet(String inspectionNo, RecordSheetReqDto recordSheetReqDto) throws Exception;

}
