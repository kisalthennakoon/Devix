package com.devix.backend.service.Impl;

import com.devix.backend.dto.InspectionRequestDto;
import com.devix.backend.dto.InspectionResponseDto;
import com.devix.backend.dto.RecordSheetReqDto;
import com.devix.backend.model.BaselineImage;
import com.devix.backend.model.Inspection;
import com.devix.backend.model.RecordSheet;
import com.devix.backend.model.Transformer;
import com.devix.backend.repo.BaseImageRepo;
import com.devix.backend.repo.InspectionRepo;
import com.devix.backend.repo.RecordSheetRepo;
import com.devix.backend.repo.TransformerRepo;
import com.devix.backend.service.InspectionService;
import com.devix.backend.service.MapperService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;


import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class InspectionServiceImpl implements InspectionService {

    private final InspectionRepo inspectionRepo;
    private final TransformerRepo transformerRepo;
    private final MapperService mapperService;
    private final BaseImageRepo baseImageRepo;
    private final RecordSheetRepo recordSheetRepo;
    private final LocalImageService localImageService;

    public InspectionServiceImpl(TransformerRepo transformerRepo, InspectionRepo inspectionRepo, BaseImageRepo baseImageRepo, RecordSheetRepo recordSheetRepo, LocalImageService localImageService) {
        this.transformerRepo = transformerRepo;
        this.inspectionRepo = inspectionRepo;
        this.baseImageRepo = baseImageRepo;
        this.recordSheetRepo = recordSheetRepo;
        this.mapperService = MapperService.INSTANCE;
        this.localImageService = localImageService;
    }

    @Override
    public void createInspection(InspectionRequestDto inspection) throws Exception {
        try {
            log.info("Creating inspection with details: {}", inspection);
            if (transformerRepo.findByTransformerNo(inspection.getTransformerNo()) == null) {
                throw new Exception("Transformer with number " + inspection.getTransformerNo() + " does not exist.");
            }
            String inspectionNo = generateInspectionNo();
            Inspection newInspection = mapperService.toInspectionEntity(inspection);
            newInspection.setInspectionNo(inspectionNo);
            inspectionRepo.save(newInspection);

        } catch (Exception e) {
            log.error("Error creating inspection: {}", e.getMessage());
            throw new Exception("Error creating inspection: " + e.getMessage());

        }

    }



    @Override
    public InspectionResponseDto getInspection(String inspectionNo) throws Exception {
        try {
            log.info("Fetching inspection with number: {}", inspectionNo);
            Inspection inspection = inspectionRepo.findByInspectionNo(inspectionNo);
            if (inspection == null) {
                throw new Exception("Inspection not found");
            }
            return mapperService.toInspectionDto(inspection);
        } catch (Exception e) {
            log.error("Error fetching inspection: {}", e.getMessage());
            throw new Exception("Error fetching inspection: " + e.getMessage());
        }
    }

    @Override
    public List<InspectionResponseDto> getAllInspections() throws Exception {
        try {
            log.info("Fetching all inspections");
            List<Inspection> inspections = inspectionRepo.findAll();
            return inspections.stream()
                    .map(mapperService::toInspectionDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching inspections: {}", e.getMessage());
            throw new Exception("Error fetching inspections: " + e.getMessage());
        }
    }

    @Override
    public void updateInspection(String inspectionNo, InspectionRequestDto inspection) throws Exception {
        try {
            log.info("Updating inspection with details: {}", inspection);
            Inspection existingInspection = inspectionRepo.findByInspectionNo(inspectionNo);
            if (existingInspection == null) {
                throw new Exception("Inspection not found");
            }
            Inspection updatedInspection = mapperService.toInspectionEntity(inspection);
            updatedInspection.setId(existingInspection.getId()); // Preserve the ID
            updatedInspection.setInspectionNo(existingInspection.getInspectionNo()); // Preserve the inspection number

            inspectionRepo.save(updatedInspection);
            log.info("Inspection updated successfully");
        } catch (Exception e) {
            log.error("Error updating inspection: {}", e.getMessage());
            throw new Exception("Error updating inspection: " + e.getMessage());
        }
    }

    @Override
    public void deleteInspection(String inspectionNo) throws Exception {
        try {
            log.info("Deleting inspection with number: {}", inspectionNo);
            Inspection inspection = inspectionRepo.findByInspectionNo(inspectionNo);
            if (inspection == null) {
                throw new Exception("Inspection not found");
            }
            inspectionRepo.delete(inspection);
            log.info("Inspection deleted successfully");
        } catch (Exception e) {
            log.error("Error deleting inspection: {}", e.getMessage());
            throw new Exception("Error deleting inspection: " + e.getMessage());
        }

    }



    private String generateInspectionNo() {
        Integer maxInspectionNo = inspectionRepo.findMaxInspectionNo();
        if (maxInspectionNo == null) {
            maxInspectionNo = 0;
        }
        return String.format("%05d", maxInspectionNo + 1);

    }

    @Override
    public List<InspectionResponseDto> getInspectionsByTransformerNo(String transformerNo) throws Exception {
        try {
            log.info("Fetching inspections for transformer number: {}", transformerNo);
            List<Inspection> inspections = inspectionRepo.findByTransformerNo(transformerNo);
            return inspections.stream()
                    .map(mapperService::toInspectionDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching inspections by TransformerNo: {}", e.getMessage());
            throw new Exception("Error fetching inspections: " + e.getMessage());
        }
    }

    @Override
    public Map<String, String> inspectionStatus(String inspectionNo) throws Exception {
        try {
            log.info("Fetching inspection status for number: {}", inspectionNo);
            Inspection inspection = inspectionRepo.findByInspectionNo(inspectionNo);
            if (inspection == null) {
                throw new Exception("Inspection not found");
            }
            BaselineImage baselineImage = baseImageRepo.findByTransformerNo(inspection.getTransformerNo());
            Map<String, String> statusMap = new HashMap<>();
            statusMap.put("inspectionStatus", inspection.getInspectionStatus());
            String baselineImageStatus = "no_image";
            if(baselineImage != null){
                baselineImageStatus = "exist";
            }
            statusMap.put("baselineImageStatus", baselineImageStatus);
            return statusMap;
        } catch (Exception e) {
            log.error("Error fetching inspection status: {}", e.getMessage());
            throw new Exception("Error fetching inspection status: " + e.getMessage());
        }
    }

    @Override
    public RecordSheet getRecordSheetByInspectionNo(String inspectionNo) throws Exception {
        try {
            log.info("Fetching record sheet for inspection: {}", inspectionNo);
            Inspection inspection = inspectionRepo.findByInspectionNo(inspectionNo);
            if (inspection == null) {
                throw new Exception("Inspection not found");
            }
            RecordSheet recordSheet = recordSheetRepo.findByInspection(inspection);
            if (recordSheet == null) {
                throw new Exception("Record sheet not found for inspection: " + inspectionNo);
            }
            
            return recordSheet;
        } catch (Exception e) {
            log.error("Error fetching record sheet: {}", e.getMessage());
            throw new Exception("Error fetching record sheet: " + e.getMessage());
        }
    }

    @Override
    public void updateRecordSheet(String inspectionNo, RecordSheetReqDto recordSheetReqDto) throws Exception {
        try {
            log.info("Updating record sheet for inspection: {}", inspectionNo);
            Inspection inspection = inspectionRepo.findByInspectionNo(inspectionNo);
            if (inspection == null) {
                throw new Exception("Inspection not found");
            }
            RecordSheet existingRecordSheet = recordSheetRepo.findByInspection(inspection);
            if (existingRecordSheet == null) {
                throw new Exception("Record sheet not found for inspection: " + inspectionNo);
            }   
            //use mapper service here
            RecordSheet updatedRecordSheet = mapperService.toRecordSheetEntity(recordSheetReqDto);
            updatedRecordSheet.setId(existingRecordSheet.getId()); // Preserve the ID
            updatedRecordSheet.setInspection(existingRecordSheet.getInspection()); // Preserve the inspection relation
            updatedRecordSheet.setTransformer(existingRecordSheet.getTransformer());
    
            recordSheetRepo.save(updatedRecordSheet);
            log.info("Record sheet updated successfully");

            inspection.setInspectionStatus("Completed");
            inspectionRepo.save(inspection);

        } catch (Exception e) {
            log.error("Error updating record sheet: {}", e.getMessage());
            throw new Exception("Error updating record sheet: " + e.getMessage());
        }
    }
     
}