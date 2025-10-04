package com.devix.backend.Config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.devix.backend.model.BaselineImage;
import com.devix.backend.model.Inspection;
import com.devix.backend.model.InspectionImage;
import com.devix.backend.model.Transformer;
import com.devix.backend.repo.BaseImageRepo;
import com.devix.backend.repo.InspectionImageRepo;
import com.devix.backend.repo.InspectionRepo;
import com.devix.backend.repo.TransformerRepo;


@Component
public class DataSeeder implements CommandLineRunner {

    @Value("${backend.absolute.path}")
    private String backendPath; 

    private final TransformerRepo transformerRepo;
    private final InspectionRepo inspectionRepo;
    private final BaseImageRepo baseImageRepo;
    private final InspectionImageRepo inspectionImageRepo;

    public DataSeeder(TransformerRepo transformerRepo, InspectionRepo inspectionRepo, BaseImageRepo baseImageRepo, InspectionImageRepo inspectionImageRepo) {
        this.transformerRepo = transformerRepo;
        this.inspectionRepo = inspectionRepo;
        this.baseImageRepo = baseImageRepo;
        this.inspectionImageRepo = inspectionImageRepo;
    }

    @Override
    public void run(String... args) throws Exception {
        // Check if transformers already exist to avoid duplicate seeding
        if (transformerRepo.count() == 0) {
            // Create sample transformers
            Transformer transformer1 = new Transformer("AZ-001", "Distribution", "001", "Colombo", "Location A", "100 kVA");
            Transformer transformer2 = new Transformer("AZ-002", "Distribution", "002", "Kandy", "Location B", "200 kVA");
            Transformer transformer3 = new Transformer("AZ-003", "Transmission", "003", "Galle", "Location C", "500 kVA");
            Transformer transformer4 = new Transformer("AZ-004", "Distribution", "004", "Jaffna", "Location D", "150 kVA");
            Transformer transformer5 = new Transformer("AZ-005", "Transmission", "005", "Matara", "Location E", "300 kVA");

            transformerRepo.saveAll(List.of(transformer1, transformer2, transformer3, transformer4, transformer5));

            Inspection inspection1 = new Inspection("00001", "2023-10-01", "10:00", "Colombo", "in_progress", "AZ-001", "Devix");
            Inspection inspection2 = new Inspection("00002", "2023-10-02", "11:00", "Kandy", "in_progress", "AZ-002", "Devix");
            Inspection inspection3 = new Inspection("00003", "2023-10-03", "12:00", "Galle", "in_progress", "AZ-003", "Devix");
            Inspection inspection4 = new Inspection("00004", "2023-10-04", "13:00", "Jaffna", "in_progress", "AZ-004", "Devix");
            Inspection inspection5 = new Inspection("00005", "2023-10-05", "14:00", "Matara", "in_progress", "AZ-005", "Devix");
            Inspection inspection6 = new Inspection("00006", "2023-10-06", "15:00", "Colombo", "in_progress", "AZ-002", "Devix");

            inspectionRepo.saveAll(List.of(inspection1, inspection2, inspection3, inspection4, inspection5, inspection6));

            String seedImagePath = backendPath + "/src/main/resources/seed_images/";
            
 
            BaselineImage baseImage1 = new BaselineImage("AZ-001", seedImagePath + "T9_normal_001.jpg", seedImagePath + "T9_normal_002.jpg", seedImagePath + "T9_normal_003.jpg", "Devix", "2023-10-01", "10:00");
            BaselineImage baseImage2 = new BaselineImage("AZ-002", seedImagePath + "T10_normal_001.jpg", seedImagePath + "T10_normal_002.jpg", seedImagePath + "T10_normal_003.jpg", "Devix", "2023-10-02", "11:00");
            BaselineImage baseImage3 = new BaselineImage("AZ-003", seedImagePath + "T11_normal_001.jpg", seedImagePath + "T11_normal_002.jpg", seedImagePath + "T11_normal_003.jpg", "Devix", "2023-10-03", "12:00");
            BaselineImage baseImage4 = new BaselineImage("AZ-004", seedImagePath + "T12_normal_001.jpg", seedImagePath + "T12_normal_002.jpg", seedImagePath + "T12_normal_003.jpg", "Devix", "2023-10-04", "13:00");
            BaselineImage baseImage5 = new BaselineImage("AZ-005", seedImagePath + "T13_normal_001.jpg", seedImagePath + "T13_normal_002.jpg", seedImagePath + "T13_normal_003.jpg", "Devix", "2023-10-05", "14:00");

            baseImageRepo.saveAll(List.of(baseImage1, baseImage2, baseImage3, baseImage4, baseImage5));

            InspectionImage inspImage1 = new InspectionImage("00001", "AZ-001", seedImagePath + "T9_faulty_001.jpg", "Sunny", "Devix", "2023-10-01", "10:00");
            InspectionImage inspImage2 = new InspectionImage("00002", "AZ-002", seedImagePath + "T10_faulty_001.jpg", "Cloudy", "Devix", "2023-10-02", "11:00");
            InspectionImage inspImage3 = new InspectionImage("00003", "AZ-003", seedImagePath + "T11_faulty_001.jpg", "Rainy", "Devix", "2023-10-03", "12:00");
            InspectionImage inspImage4 = new InspectionImage("00004", "AZ-004", seedImagePath + "T12_faulty_001.jpg", "Sunny", "Devix", "2023-10-04", "13:00");
            InspectionImage inspImage5 = new InspectionImage("00005", "AZ-005", seedImagePath + "T13_faulty_001.jpg", "Cloudy", "Devix", "2023-10-05", "14:00");
            InspectionImage inspImage6 = new InspectionImage("00006", "AZ-002", seedImagePath + "T10_faulty_002.jpg", "Rainy", "Devix", "2023-10-06", "15:00");

            inspectionImageRepo.saveAll(List.of(inspImage1, inspImage2, inspImage3, inspImage4, inspImage5, inspImage6));
        }
    }

}   
