package com.hatchlab.securityscore.api;

public record SecurityScoreBreakdownResponse(
        int attackPreventionPoints,
        int attemptReductionPoints,
        int blockingPoints,
        int defensiveOutcomePoints
) {
}