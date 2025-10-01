package com.devix.backend.service;

import com.devix.backend.model.AiResults;
import com.devix.backend.model.Inspection;
import com.devix.backend.model.InspectionImage;
import com.devix.backend.repo.AiResultsRepo;
import com.devix.backend.repo.InspectionImageRepo;
import com.devix.backend.repo.InspectionRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class AiService {

    private final WebClient webClient = WebClient.create("http://localhost:5001");

    private final InspectionImageRepo inspectionImageRepo;
    private final InspectionRepo inspectionRepo;
    private final AiResultsRepo aiResultsRepo;

    public AiService(InspectionRepo inspectionRepo, InspectionImageRepo inspectionImageRepo, AiResultsRepo aiResultsRepo) {
        this.inspectionImageRepo = inspectionImageRepo;
        this.inspectionRepo = inspectionRepo;
        this.aiResultsRepo = aiResultsRepo;
    }

    public Object getPrediction(String imageUrl) {
        return webClient.post()
                .uri("/predict")
                .bodyValue(Map.of("data", imageUrl))
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    @Scheduled(fixedRate = 1000*60*15) // every 15 minutes
    public void analysis() {
        try{
            List<Inspection> inspections = inspectionRepo.findAllByStatus("pending");
            for (Inspection inspection : inspections) {
                InspectionImage image = inspectionImageRepo.findByInspectionNo(inspection.getInspectionNo());
                String imageUrl = image != null ? image.getThermalImageUrl() : null;

                if (imageUrl != null) {
                    Object prediction = getPrediction(imageUrl);

                    if (prediction == null) {
                        continue;
                    }

                    // Save the AI results to the database (not implemented here)
                    for (Map<String, String> result : (List<Map<String, String>>) prediction) {
                        AiResults aiResults = new AiResults();
                        aiResults.setInspectionNo(inspection.getInspectionNo());
                        aiResults.setFaultType(result.get("fault_type"));
                        aiResults.setFaultSeverity(result.get("severity"));
                        aiResults.setFaultConfidence(result.get("confidence"));
                        aiResults.setXCoordinate(result.get("x_coordinate"));
                        aiResults.setYCoordinate(result.get("y_coordinate"));
                        aiResultsRepo.save(aiResults);
                    }

                    inspection.setInspectionStatus("in_progress");
                    inspectionRepo.save(inspection);

                }
            }
        } catch (Exception e) {
            log.error("Error during AI analysis: {}", e.getMessage());
            throw new RuntimeException("Error during AI analysis: " + e.getMessage());
        }
    }

//    public static void main(String[] args){
//        AiService aiService = new AiService();
//        String prediction = aiService.getPrediction(List.of(0.5, 1.2, 3.4, 2.1));
//        System.out.println("Prediction: " + prediction);

}

