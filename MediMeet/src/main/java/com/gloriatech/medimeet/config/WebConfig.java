package com.gloriatech.medimeet.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Bean
    public MultipartResolver multipartResolver() {
        return new StandardServletMultipartResolver();
    }

    @Bean
    public MappingJackson2HttpMessageConverter mappingJackson2HttpMessageConverter() {
        return new MappingJackson2HttpMessageConverter();
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    // Define the location of doctor images on the filesystem
    private static final String UPLOAD_DIR = "D:/Documents/developing projects/medimeet/medimeet/src/assets/";

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map /api/assets/** to the filesystem location where images are stored
        registry.addResourceHandler("/api/assets/**")
                .addResourceLocations("file:" + UPLOAD_DIR)
                .setCachePeriod(3600) // Cache for 1 hour
                .resourceChain(true);

        System.out.println("Configured resource handler for /api/assets/** to serve from: " + UPLOAD_DIR);
    }
}
