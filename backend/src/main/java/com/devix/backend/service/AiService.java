package com.devix.backend.service;

import com.devix.backend.model.AiResults;
import com.devix.backend.model.Inspection;
import com.devix.backend.model.InspectionImage;
import com.devix.backend.repo.AiResultsRepo;
import com.devix.backend.repo.InspectionImageRepo;
import com.devix.backend.repo.InspectionRepo;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.File;
import java.net.http.HttpHeaders;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.annotation.PostConstruct;

@Service
@Slf4j
public class AiService {

    @Value("${huggingface.api.url}")
    private String huggingFaceApiUrl;

    private WebClient webClient;

    private final InspectionImageRepo inspectionImageRepo;
    private final InspectionRepo inspectionRepo;
    private final AiResultsRepo aiResultsRepo;

    public AiService(InspectionRepo inspectionRepo, InspectionImageRepo inspectionImageRepo, AiResultsRepo aiResultsRepo) {
        this.inspectionImageRepo = inspectionImageRepo;
        this.inspectionRepo = inspectionRepo;
        this.aiResultsRepo = aiResultsRepo;
    }

    @PostConstruct
    public void initWebClient() {
        this.webClient = WebClient.create(huggingFaceApiUrl);
    }

    public List<Map<String, Object>> getPrediction(String imagePath) {
        try {
            File file = new File(imagePath);
            if (!file.exists()) {
                throw new RuntimeException("Image file not found: " + imagePath);
            }

            String response = webClient.post()
                    .uri("api/predict")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData("file", new FileSystemResource(file)))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readValue(response, new TypeReference<List<Map<String, Object>>>() {
            });
        } catch (Exception e) {
            log.error("Failed to parse AI prediction response: {}", e.getMessage());
            throw new RuntimeException("Failed to parse AI prediction response: " + e.getMessage());
        }
    }

    @Scheduled(fixedRate = 1000 * 60 * 5) // every 15 minutes
    public void analysis() {
        try {
            List<Inspection> inspections = inspectionRepo.findAllByInspectionStatus("pending");
            for (Inspection inspection : inspections) {
                InspectionImage image = inspectionImageRepo.findByInspectionNo(inspection.getInspectionNo());
                String imageUrl = image != null ? image.getThermalImageUrl() : null;

                if (imageUrl != null) {
                    List<Map<String, Object>> prediction = getPrediction(imageUrl);

                    if (prediction == null) {
                        continue;
                    }
                    if (prediction.isEmpty()) {
                        AiResults aiResults = new AiResults();
                        aiResults.setInspectionNo(inspection.getInspectionNo());
                        aiResults.setAnomalyStatus("no_anomaly");
                        aiResultsRepo.save(aiResults);
                    } else {
                        for (Map<String, Object> result : prediction) {
                            AiResults aiResults = new AiResults();

                            aiResults.setInspectionNo(inspection.getInspectionNo());
                            aiResults.setFaultType((String) result.get("fault_type"));
                            aiResults.setFaultSeverity(
                                    result.get("severity") != null ? result.get("severity").toString() : null);
                            aiResults.setFaultConfidence(
                                    result.get("confidence") != null ? result.get("confidence").toString() : null);
                            aiResults.setXCoordinate(
                                    result.get("x_coordinate") != null ? result.get("x_coordinate").toString() : null);
                            aiResults.setYCoordinate(
                                    result.get("y_coordinate") != null ? result.get("y_coordinate").toString() : null);

                            // Store bbox as JSON string if present
                            Object bboxObj = result.get("bbox");
                            if (bboxObj != null) {
                                try {
                                    ObjectMapper mapper = new ObjectMapper();
                                    aiResults.setBbox(mapper.writeValueAsString(bboxObj));
                                } catch (Exception e) {
                                    aiResults.setBbox(null);
                                }
                            } else {
                                aiResults.setBbox(null);
                            }

                            aiResults
                                    .setAreaPx(result.get("area_px") != null ? result.get("area_px").toString() : null);
                            aiResults.setHotspotX(
                                    result.get("hotspot_x") != null ? result.get("hotspot_x").toString() : null);
                            aiResults.setHotspotY(
                                    result.get("hotspot_y") != null ? result.get("hotspot_y").toString() : null);

                            aiResultsRepo.save(aiResults);
                        }

                    }
                    // Save the AI results to the database (not implemented here)

                    inspection.setInspectionStatus("in_progress");
                    inspectionRepo.save(inspection);

                }
            }
        } catch (Exception e) {
            log.error("Error during AI analysis: {}", e.getMessage());
            throw new RuntimeException("Error during AI analysis: " + e.getMessage());
        }
    }

    // public static void main(String[] args){
    // AiService aiService = new AiService();
    // String prediction = aiService.getPrediction(List.of(0.5, 1.2, 3.4, 2.1));
    // System.out.println("Prediction: " + prediction);

}
