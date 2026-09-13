package com.hatchlab.securityevent.api;

import com.hatchlab.common.api.PageResponse;
import com.hatchlab.securityevent.SecurityEventQueryService;
import com.hatchlab.securityevent.SecurityEventSeverity;
import com.hatchlab.securityevent.SecurityEventType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/security-events")
public class SecurityEventController {

    private final SecurityEventQueryService securityEventQueryService;

    public SecurityEventController(
            SecurityEventQueryService securityEventQueryService
    ) {
        this.securityEventQueryService = securityEventQueryService;
    }

    @GetMapping
    public PageResponse<SecurityEventResponse> findEvents(
            @RequestParam(required = false)
            SecurityEventType eventType,

            @RequestParam(required = false)
            SecurityEventSeverity severity,

            @RequestParam(required = false)
            String search,

            @PageableDefault(
                    size = 25,
                    sort = "timestamp",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable
    ) {
        return securityEventQueryService.findEvents(
                eventType,
                severity,
                search,
                pageable
        );
    }
}