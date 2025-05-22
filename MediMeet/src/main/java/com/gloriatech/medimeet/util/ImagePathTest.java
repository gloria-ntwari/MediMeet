package com.gloriatech.medimeet.util;

import java.io.File;
import java.util.Arrays;

/**
 * Utility class to test if images exist in the specified directory
 */
public class ImagePathTest {
    // Define the same upload directory as in service/controller
    private static final String UPLOAD_DIR = "D:/Documents/developing projects/medimeet/medimeet/src/assets/";
    // Filenames to check
    private static final String[] TEST_FILES = {
        "838d6379-f72d-4099-86a5-e531f73c8311.png",
        "841cf6f2-9e8e-40c8-8782-30f15ff668c9.png"
    };

    public static void main(String[] args) {
        System.out.println("Testing image accessibility...");
        System.out.println("Upload directory: " + UPLOAD_DIR);
        
        File uploadDir = new File(UPLOAD_DIR);
        
        // Check if directory exists
        System.out.println("Directory exists: " + uploadDir.exists());
        if (!uploadDir.exists()) {
            System.out.println("Creating directory structure...");
            boolean created = uploadDir.mkdirs();
            System.out.println("Directory created: " + created);
        }
        
        // List all files in directory
        File[] files = uploadDir.listFiles();
        System.out.println("\nFiles in directory:");
        if (files != null && files.length > 0) {
            Arrays.stream(files).forEach(file -> 
                System.out.println(" - " + file.getName() + " (" + file.length() + " bytes)"));
        } else {
            System.out.println("No files found in directory or directory cannot be accessed.");
        }
        
        // Check specific test files
        System.out.println("\nChecking specific files:");
        for (String filename : TEST_FILES) {
            File file = new File(UPLOAD_DIR + filename);
            System.out.println(filename + ": exists=" + file.exists() + ", readable=" + file.canRead());
            if (file.exists()) {
                System.out.println("  File size: " + file.length() + " bytes");
            }
        }
        
        // Suggest frontend configuration
        System.out.println("\nFrontend URL suggestion:");
        for (String filename : TEST_FILES) {
            System.out.println("/api/assets/" + filename);
        }
    }
} 