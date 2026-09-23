package com.hatchlab.securityscore.api;

import com.hatchlab.securityscore.SecurityScoreService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/security-score")
public class SecurityScoreController {

    private final SecurityScoreService securityScoreService;

    public SecurityScoreController(
            SecurityScoreService securityScoreService
    ) {
        this.securityScoreService = securityScoreService;
    }

    @GetMapping
    public SecurityScoreResponse calculateSecurityScore(
            @RequestParam("baselineId")
            UUID baselineId,

            @RequestParam("protectedId")
            UUID protectedId
    ) {
        return securityScoreService.calculate(
                baselineId,
                protectedId
        );
    }
}