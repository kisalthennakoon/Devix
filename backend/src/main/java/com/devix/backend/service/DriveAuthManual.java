//package com.devix.backend.service;
//
//import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
//import com.google.api.client.json.JsonFactory;
//import com.google.api.client.json.gson.GsonFactory;
////import com.google.api.client.json.jackson2.JacksonFactory;
//import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
//import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
//import com.google.api.client.auth.oauth2.Credential;
//import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
//import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
//
//import java.io.*;
//import java.security.GeneralSecurityException;
//import java.util.Collections;
//import java.util.List;
//
//public class DriveAuthManual {
//
//    private static final String APPLICATION_NAME = "DevixDrive";
//    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
//    private static final List<String> SCOPES = Collections.singletonList("https://www.googleapis.com/auth/drive.file");
//    private static final String TOKENS_DIRECTORY_PATH = "src/main/resources";
//
//    public static Credential authorize() throws Exception {
//        InputStream in = new FileInputStream("C:\\Users\\ACER\\Documents\\Github\\Devix\\backend\\src\\main\\resources\\client_secret_646335308823-sgifjhnfjrocs3lgv02ds7ji6ojjdqsf.apps.googleusercontent.com.json");
//        GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(JSON_FACTORY, new InputStreamReader(in));
//
//        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
//                GoogleNetHttpTransport.newTrustedTransport(),
//                JSON_FACTORY,
//                clientSecrets,
//                SCOPES)
//                .setDataStoreFactory(new com.google.api.client.util.store.FileDataStoreFactory(new java.io.File(TOKENS_DIRECTORY_PATH)))
//                .setAccessType("offline")  // ensures refresh token
//                .build();
//
//        LocalServerReceiver receiver = new LocalServerReceiver.Builder().setPort(8888).build();
//
//        return new AuthorizationCodeInstalledApp(flow, receiver).authorize("user");
//    }
//
//    public static void main(String[] args) throws Exception {
//        Credential credential = authorize();
//        System.out.println("Access Token: " + credential.getAccessToken());
//        System.out.println("Refresh Token: " + credential.getRefreshToken());
//    }
//}
//
