package com.hatchlab.labreset.api;

import com.hatchlab.labreset.LabResetService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/lab")
public class LabResetController {

    private final LabResetService labResetService;

    public LabResetController(
            LabResetService labResetService
    ) {
        this.labResetService = labResetService;
    }

    @PostMapping("/reset")
    public LabResetResponse resetLaboratory(
            @Valid @RequestBody LabResetRequest request
    ) {
        return labResetService.resetLaboratory();
    }
}