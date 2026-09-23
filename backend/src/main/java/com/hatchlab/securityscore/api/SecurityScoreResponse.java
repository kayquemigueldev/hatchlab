package com.hatchlab.securityscore.api;

import com.hatchlab.securityscore.SecurityRiskLevel;

import java.util.UUID;

public record SecurityScoreResponse(
        UUID baselineSessionId,
        UUID protectedSessionId,
        int score,
        SecurityRiskLevel riskLevel,
        SecurityScoreBreakdownResponse breakdown
) {
}