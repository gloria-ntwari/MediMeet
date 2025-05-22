package com.gloriatech.medimeet.util;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

public class ImageCopy {
    // Define the upload directory from the service and controller
    private static final String UPLOAD_DIR = "D:/Documents/developing projects/medimeet/medimeet/src/assets/";
    
    // Source image that exists
    private static final String SOURCE_IMAGE = "841cf6f2-9e8e-40c8-8782-30f15ff668c9.png";
    
    // Destination image that is missing
    private static final String DESTINATION_IMAGE = "838d6379-f72d-4099-86a5-e531f73c8311.png";
    
    public static void main(String[] args) {
        try {
            // Ensure the directory exists
            File directory = new File(UPLOAD_DIR);
            if (!directory.exists()) {
                System.out.println("Creating directory: " + UPLOAD_DIR);
                boolean created = directory.mkdirs();
                System.out.println("Directory created: " + created);
            }
            
            // Check source image
            Path sourcePath = Paths.get(UPLOAD_DIR + SOURCE_IMAGE);
            if (!Files.exists(sourcePath)) {
                System.out.println("Source image not found: " + sourcePath.toAbsolutePath());
                return;
            }
            
            System.out.println("Source image found: " + sourcePath.toAbsolutePath());
            System.out.println("Size: " + Files.size(sourcePath) + " bytes");
            
            // Create destination path
            Path destinationPath = Paths.get(UPLOAD_DIR + DESTINATION_IMAGE);
            
            // Copy the file
            Files.copy(sourcePath, destinationPath, StandardCopyOption.REPLACE_EXISTING);
            
            System.out.println("Image copied successfully to: " + destinationPath.toAbsolutePath());
            
            // Verify the destination file
            if (Files.exists(destinationPath)) {
                System.out.println("Destination file exists");
                System.out.println("Size: " + Files.size(destinationPath) + " bytes");
            } else {
                System.out.println("Failed to create destination file");
            }
            
            // List all files in the directory
            System.out.println("\nFiles in directory:");
            Files.list(directory.toPath())
                .forEach(file -> {
                    try {
                        System.out.println(" - " + file.getFileName() + " (" + Files.size(file) + " bytes)");
                    } catch (IOException e) {
                        System.out.println(" - " + file.getFileName() + " (error reading size)");
                    }
                });
                
        } catch (IOException e) {
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
} 