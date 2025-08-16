package com.devix.backend.service;

import com.devix.backend.dto.TransformerDto;
import com.devix.backend.model.Transformer;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface MapperService {
    MapperService INSTANCE = Mappers.getMapper(MapperService.class);

    TransformerDto toTransformerDto(Transformer transformer);
    Transformer toTransformerEntity(TransformerDto transformerDto  );
}
