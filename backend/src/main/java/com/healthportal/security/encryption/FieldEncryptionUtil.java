package com.healthportal.security.encryption;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;

@Component
public class FieldEncryptionUtil {

    private static final Logger logger = LoggerFactory.getLogger(FieldEncryptionUtil.class);

    private static String secretKey;
    private static final String GCM_PREFIX = "GCM:";
    private static final String GCM_ALGORITHM = "AES/GCM/NoPadding";
    private static final String CBC_LEGACY_ALGORITHM = "AES/CBC/PKCS5Padding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH_BITS = 128;

    @Value("${app.security.encryption-key:HealthPortalSecretKeyAES256Pass!}")
    public void setSecretKey(String key) {
        if (key == null || key.isBlank() || key.length() < 16) {
            logger.warn("Security warning: FIELD_ENCRYPTION_KEY is weak or using default value. Please set a strong 32-char key in production.");
            secretKey = "HealthPortalSecretKeyAES256Pass!";
        } else {
            secretKey = key;
        }
    }

    private static SecretKeySpec getKeySpec() {
        byte[] keyBytes = Arrays.copyOf(secretKey.getBytes(StandardCharsets.UTF_8), 32);
        return new SecretKeySpec(keyBytes, "AES");
    }

    /**
     * Encrypt sensitive medical field using industry-standard AES-256-GCM authenticated encryption.
     */
    public static String encrypt(String plainText) {
        if (plainText == null || plainText.isEmpty()) {
            return plainText;
        }
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance(GCM_ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.ENCRYPT_MODE, getKeySpec(), parameterSpec);

            byte[] cipherText = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            byte[] combined = new byte[iv.length + cipherText.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(cipherText, 0, combined, iv.length, cipherText.length);

            return GCM_PREFIX + Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            logger.error("Error encrypting medical field with AES-GCM: {}", e.getMessage());
            throw new RuntimeException("Encryption failed for sensitive medical data", e);
        }
    }

    /**
     * Decrypt sensitive field. Supports both modern AES-256-GCM and legacy AES-CBC records.
     */
    public static String decrypt(String encryptedText) {
        if (encryptedText == null || encryptedText.isEmpty()) {
            return encryptedText;
        }

        // 1. Decrypt modern AES-256-GCM
        if (encryptedText.startsWith(GCM_PREFIX)) {
            try {
                String payload = encryptedText.substring(GCM_PREFIX.length());
                byte[] combined = Base64.getDecoder().decode(payload);
                if (combined.length <= GCM_IV_LENGTH) {
                    return encryptedText;
                }

                byte[] iv = Arrays.copyOfRange(combined, 0, GCM_IV_LENGTH);
                byte[] cipherText = Arrays.copyOfRange(combined, GCM_IV_LENGTH, combined.length);

                Cipher cipher = Cipher.getInstance(GCM_ALGORITHM);
                GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv);
                cipher.init(Cipher.DECRYPT_MODE, getKeySpec(), parameterSpec);

                byte[] plainBytes = cipher.doFinal(cipherText);
                return new String(plainBytes, StandardCharsets.UTF_8);
            } catch (Exception e) {
                logger.error("Failed to decrypt AES-GCM encrypted field: {}", e.getMessage());
                return encryptedText;
            }
        }

        // 2. Legacy fallback for AES-CBC records
        try {
            byte[] combined = Base64.getDecoder().decode(encryptedText);
            if (combined.length <= 16) {
                return encryptedText; // plaintext or invalid
            }

            byte[] iv = Arrays.copyOfRange(combined, 0, 16);
            byte[] cipherText = Arrays.copyOfRange(combined, 16, combined.length);

            Cipher cipher = Cipher.getInstance(CBC_LEGACY_ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, getKeySpec(), new IvParameterSpec(iv));

            byte[] original = cipher.doFinal(cipherText);
            return new String(original, StandardCharsets.UTF_8);
        } catch (Exception e) {
            // Text was likely stored unencrypted or plaintext
            return encryptedText;
        }
    }
}
