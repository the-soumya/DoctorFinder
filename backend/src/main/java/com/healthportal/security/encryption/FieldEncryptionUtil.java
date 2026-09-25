package com.healthportal.security.encryption;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;

@Component
public class FieldEncryptionUtil {

    private static String secretKey;

    @Value("${app.security.encryption-key:HealthPortalSecretKeyAES256Pass!}")
    public void setSecretKey(String key) {
        secretKey = key;
    }

    private static final String ALGORITHM = "AES/CBC/PKCS5Padding";

    public static String encrypt(String plainText) {
        if (plainText == null || plainText.isEmpty()) {
            return plainText;
        }
        try {
            byte[] keyBytes = Arrays.copyOf(secretKey.getBytes(StandardCharsets.UTF_8), 32);
            SecretKeySpec secretKeySpec = new SecretKeySpec(keyBytes, "AES");

            byte[] iv = new byte[16];
            new SecureRandom().nextBytes(iv);
            IvParameterSpec ivSpec = new IvParameterSpec(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKeySpec, ivSpec);

            byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            byte[] combined = new byte[iv.length + encrypted.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(encrypted, 0, combined, iv.length, encrypted.length);

            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            throw new RuntimeException("Error encrypting sensitive medical field", e);
        }
    }

    public static String decrypt(String encryptedText) {
        if (encryptedText == null || encryptedText.isEmpty()) {
            return encryptedText;
        }
        try {
            byte[] keyBytes = Arrays.copyOf(secretKey.getBytes(StandardCharsets.UTF_8), 32);
            SecretKeySpec secretKeySpec = new SecretKeySpec(keyBytes, "AES");

            byte[] combined = Base64.getDecoder().decode(encryptedText);
            if (combined.length <= 16) {
                return encryptedText; // not encrypted or corrupted
            }

            byte[] iv = Arrays.copyOfRange(combined, 0, 16);
            byte[] encrypted = Arrays.copyOfRange(combined, 16, combined.length);

            IvParameterSpec ivSpec = new IvParameterSpec(iv);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKeySpec, ivSpec);

            byte[] original = cipher.doFinal(encrypted);
            return new String(original, StandardCharsets.UTF_8);
        } catch (Exception e) {
            // Fallback for unencrypted legacy or plain text
            return encryptedText;
        }
    }
}
