package com.healthportal.security.ratelimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitingService {

    @Value("${app.ai.rate-limit.capacity:10}")
    private long capacity;

    @Value("${app.ai.rate-limit.refill-tokens:10}")
    private long refillTokens;

    @Value("${app.ai.rate-limit.refill-duration-minutes:1}")
    private long refillDurationMinutes;

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket createNewBucket() {
        Refill refill = Refill.greedy(refillTokens, Duration.ofMinutes(refillDurationMinutes));
        Bandwidth limit = Bandwidth.classic(capacity, refill);
        return Bucket.builder().addLimit(limit).build();
    }

    public Bucket resolveBucket(String key) {
        return buckets.computeIfAbsent(key, k -> createNewBucket());
    }

    public boolean tryConsume(String key) {
        Bucket bucket = resolveBucket(key);
        return bucket.tryConsume(1);
    }
}
