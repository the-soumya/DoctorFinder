package com.healthportal.security.encryption;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class DiagnosisNotesConverter implements AttributeConverter<String, String> {

    @Override
    public String convertToDatabaseColumn(String attribute) {
        return FieldEncryptionUtil.encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        return FieldEncryptionUtil.decrypt(dbData);
    }
}
