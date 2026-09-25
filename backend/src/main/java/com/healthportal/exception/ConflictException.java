package com.healthportal.exception;

public class ConflictException extends RuntimeException {

    private Object details;

    public ConflictException(String message) {
        super(message);
    }

    public ConflictException(String message, Object details) {
        super(message);
        this.details = details;
    }

    public Object getDetails() {
        return details;
    }
}
