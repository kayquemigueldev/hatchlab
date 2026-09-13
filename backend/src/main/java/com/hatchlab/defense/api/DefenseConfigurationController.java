package com.hatchlab.defense.api;

import com.hatchlab.defense.SecurityConfigurationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/defense-config")
public class DefenseConfigurationController {

    private final SecurityConfigurationService service;

    public DefenseConfigurationController(
            SecurityConfigurationService service
    ) {
        this.service = service;
    }

    @GetMapping
    public DefenseConfigurationResponse getConfiguration() {
        return service.getConfiguration();
    }

    @PutMapping
    public DefenseConfigurationResponse updateConfiguration(
            @RequestBody DefenseConfigurationRequest request
    ) {
        return service.updateConfiguration(request);
    }
}