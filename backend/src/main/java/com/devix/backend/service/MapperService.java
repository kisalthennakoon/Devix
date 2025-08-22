package com.devix.backend.service;

import com.devix.backend.dto.InspectionRequestDto;
import com.devix.backend.dto.InspectionResponseDto;
import com.devix.backend.dto.TransformerRequestDto;
import com.devix.backend.dto.TransformerResponseDto;
import com.devix.backend.model.Inspection;
import com.devix.backend.model.Transformer;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface MapperService {
    MapperService INSTANCE = Mappers.getMapper(MapperService.class);

    TransformerResponseDto toTransformerDto(Transformer transformer);
    Transformer toTransformerEntity(TransformerRequestDto transformerRequestDto);

    InspectionResponseDto toInspectionDto(Inspection inspection);
    Inspection toInspectionEntity(InspectionRequestDto inspectionRequestDto);
}
