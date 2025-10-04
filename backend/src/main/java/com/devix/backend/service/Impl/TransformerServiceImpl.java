package com.devix.backend.service.Impl;

import com.devix.backend.dto.TransformerRequestDto;
import com.devix.backend.dto.TransformerResponseDto;
import com.devix.backend.model.Inspection;
import com.devix.backend.model.Transformer;
import com.devix.backend.repo.BaseImageRepo;
import com.devix.backend.repo.InspectionImageRepo;
import com.devix.backend.repo.InspectionRepo;
import com.devix.backend.repo.TransformerRepo;
import com.devix.backend.service.MapperService;
import com.devix.backend.service.TransformerService;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class TransformerServiceImpl implements TransformerService {

    private final TransformerRepo transformerRepo;
    private final MapperService mapperService;
    private final InspectionRepo inspectionRepo;
    private final BaseImageRepo baselineImageRepo;
    private final InspectionImageRepo inspectionImageRepo;


    public TransformerServiceImpl(TransformerRepo transformerRepo, InspectionRepo inspectionRepo, BaseImageRepo baselineImageRepo, InspectionImageRepo inspectionImageRepo) {
        this.transformerRepo = transformerRepo;
        this.mapperService = MapperService.INSTANCE;
        this.inspectionRepo = inspectionRepo;
        this.inspectionImageRepo = inspectionImageRepo;
        this.baselineImageRepo = baselineImageRepo;
    }

    @Override
    public void createTransformer(TransformerRequestDto transformerRequestDto) throws Exception {

        try {
            log.info("Creating transformer with details: {}", transformerRequestDto);

            if (transformerRepo.findByTransformerNo(transformerRequestDto.getTransformerNo()) != null) {
                throw new Exception("Transformer with this number already exists");
            }

            transformerRepo.save(mapperService.toTransformerEntity(transformerRequestDto));
            log.info("Transformer created");
        }catch (Exception e) {
            log.error("Error creating transformer: {}", e.getMessage());
            throw new Exception("Error creating transformer: " + e.getMessage());
        }
    }



    @Override
    public TransformerResponseDto getTransformer(String transformerNo) throws Exception {
        try {
            log.info("Fetching transformer with number: {}", transformerNo);
            Transformer transformer = transformerRepo.findByTransformerNo(transformerNo);
            if (transformer == null) {
                throw new Exception("Transformer not found");
            }
            return mapperService.toTransformerDto(transformer);
        } catch (Exception e) {
            log.error("Error fetching transformer: {}", e.getMessage());
            throw new Exception("Error fetching transformer: " + e.getMessage());
        }
    }

    @Override
    public List<TransformerResponseDto> getAllTransformers() throws Exception {
        try {
            log.info("Fetching all transformers");
            List<Transformer> transformers = transformerRepo.findAll();
            return transformers.stream()
                    .map(mapperService::toTransformerDto)
                    .toList();

        } catch (Exception e) {
            log.error("Error fetching all transformers: {}", e.getMessage());
            throw new Exception("Error fetching all transformers: " + e.getMessage());
        }
    }

    @Override
    public void updateTransformer(TransformerRequestDto transformerRequestDto) throws Exception {
        try {
            log.info("Updating transformer with details: {}", transformerRequestDto);
            Transformer existingTransformer = transformerRepo.findByTransformerNo(transformerRequestDto.getTransformerNo());
            if (existingTransformer == null) {
                throw new Exception("Transformer not found");
            }
            
            existingTransformer.setTransformerLocation(transformerRequestDto.getTransformerLocation());
            existingTransformer.setTransformerPoleNo(transformerRequestDto.getTransformerPoleNo());
            existingTransformer.setTransformerRegion(transformerRequestDto.getTransformerRegion());
            existingTransformer.setTransformerType(transformerRequestDto.getTransformerType());
            existingTransformer.setTransformerCapacity(transformerRequestDto.getTransformerCapacity());

            transformerRepo.save(existingTransformer);
            log.info("Transformer updated");
        } catch (Exception e) {
            log.error("Error updating transformer: {}", e.getMessage());
            throw new Exception("Error updating transformer: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void deleteTransformer(String transformerNo) throws Exception {
        try {
            log.info("Deleting transformer with number: {}", transformerNo);
            Transformer existingTransformer = transformerRepo.findByTransformerNo(transformerNo);
            if (existingTransformer == null) {
                throw new Exception("Transformer not found");
            }
            transformerRepo.delete(existingTransformer);
            baselineImageRepo.deleteByTransformerNo(transformerNo);
            inspectionRepo.deleteAllByTransformerNo(transformerNo);
            inspectionImageRepo.deleteAllByTransformerNo(transformerNo);

            log.info("Transformer deleted");
        } catch (Exception e) {
            log.error("Error deleting transformer: {}", e.getMessage());
            throw new Exception("Error deleting transformer: " + e.getMessage());
        }
    }

    @Override
    public Map<String, String> lastInspectedDate(String transformerNo) throws Exception {
        try {
            log.info("Fetching last inspected date for transformer: {}", transformerNo);
            Inspection lastInspection = inspectionRepo.findTopByTransformerNoOrderByInspectionDateDescInspectionTimeDesc(transformerNo);

            if (lastInspection == null) {
                throw new Exception("No inspections found for transformer");
            }
            Map<String, String> dateTime = new HashMap<>();
            dateTime.put("date", lastInspection.getInspectionDate());
            dateTime.put("time", lastInspection.getInspectionTime());

            return dateTime;
        } catch (Exception e) {
            log.error("Error fetching last inspected date: {}", e.getMessage());
            throw new Exception("Error fetching last inspected date: " + e.getMessage());
        }
    }

}
