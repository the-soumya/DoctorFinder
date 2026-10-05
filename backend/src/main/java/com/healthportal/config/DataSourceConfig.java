package com.healthportal.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DataSourceConfig {

    private static final Logger logger = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Value("${SPRING_DATASOURCE_URL:}")
    private String springDatasourceUrl;

    @Value("${DB_URL:}")
    private String dbUrl;

    @Value("${DB_HOST:localhost}")
    private String dbHost;

    @Value("${DB_PORT:}")
    private String dbPort;

    @Value("${DB_NAME:patient_portal}")
    private String dbName;

    @Value("${DB_USER:}")
    private String dbUser;

    @Value("${DB_PASSWORD:}")
    private String dbPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        String rawDatabaseUrl = resolveProp("DATABASE_URL", databaseUrl);

        // 1. Render / Heroku native DATABASE_URL (postgres://user:pass@host:port/dbname)
        if (rawDatabaseUrl != null && !rawDatabaseUrl.isBlank()) {
            logger.info("Found DATABASE_URL. Configuring DataSource...");
            if (rawDatabaseUrl.startsWith("postgres://") || rawDatabaseUrl.startsWith("postgresql://")) {
                try {
                    String cleanUrl = rawDatabaseUrl.startsWith("postgres://")
                            ? "postgresql://" + rawDatabaseUrl.substring("postgres://".length())
                            : rawDatabaseUrl;

                    URI uri = new URI(cleanUrl);
                    String host = uri.getHost();
                    int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                    String path = uri.getPath();
                    String dbNameFromUri = (path != null && path.length() > 1) ? path.substring(1) : resolveProp("DB_NAME", dbName);

                    String username = resolveProp("DB_USER", dbUser);
                    String password = resolveProp("DB_PASSWORD", dbPassword);

                    if (uri.getUserInfo() != null && uri.getUserInfo().contains(":")) {
                        String[] userInfo = uri.getUserInfo().split(":", 2);
                        username = userInfo[0];
                        password = userInfo[1];
                    }

                    String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + dbNameFromUri;
                    if (uri.getQuery() != null && !uri.getQuery().isBlank()) {
                        jdbcUrl += "?" + uri.getQuery();
                    }

                    logger.info("Connecting to PostgreSQL at {}:{} for database '{}'", host, port, dbNameFromUri);
                    config.setJdbcUrl(jdbcUrl);
                    if (username != null && !username.isBlank()) config.setUsername(username);
                    if (password != null) config.setPassword(password);
                    config.setDriverClassName("org.postgresql.Driver");
                    configureHikariPool(config);
                    return new HikariDataSource(config);
                } catch (Exception e) {
                    logger.error("Failed to parse DATABASE_URL as URI: {}. Proceeding to fallback.", e.getMessage());
                }
            } else if (rawDatabaseUrl.startsWith("jdbc:")) {
                config.setJdbcUrl(rawDatabaseUrl);
                String username = resolveProp("DB_USER", dbUser);
                String password = resolveProp("DB_PASSWORD", dbPassword);
                if (username != null && !username.isBlank()) config.setUsername(username);
                if (password != null) config.setPassword(password);

                if (rawDatabaseUrl.contains("postgresql")) {
                    config.setDriverClassName("org.postgresql.Driver");
                } else if (rawDatabaseUrl.contains("mysql")) {
                    config.setDriverClassName("com.mysql.cj.jdbc.Driver");
                }
                configureHikariPool(config);
                return new HikariDataSource(config);
            }
        }

        // 2. Explicit JDBC URL via SPRING_DATASOURCE_URL or DB_URL
        String explicitJdbcUrl = resolveFirstProp(
                new String[]{"SPRING_DATASOURCE_URL", "DB_URL"},
                springDatasourceUrl, dbUrl
        );

        if (explicitJdbcUrl != null && !explicitJdbcUrl.isBlank()) {
            logger.info("Configuring DataSource from explicit JDBC URL");
            config.setJdbcUrl(explicitJdbcUrl);
            String username = resolveProp("DB_USER", dbUser);
            String password = resolveProp("DB_PASSWORD", dbPassword);
            if (username != null && !username.isBlank()) config.setUsername(username);
            if (password != null) config.setPassword(password);

            if (explicitJdbcUrl.contains("postgresql")) {
                config.setDriverClassName("org.postgresql.Driver");
            } else if (explicitJdbcUrl.contains("mysql")) {
                config.setDriverClassName("com.mysql.cj.jdbc.Driver");
            }
            configureHikariPool(config);
            return new HikariDataSource(config);
        }

        // 3. Fallback resolution using DB_HOST, DB_PORT, DB_USER, DB_PASSWORD
        String host = resolveProp("DB_HOST", dbHost);
        if (host == null || host.isBlank()) host = "localhost";

        String port = resolveProp("DB_PORT", dbPort);
        String user = resolveProp("DB_USER", dbUser);
        String pass = resolveProp("DB_PASSWORD", dbPassword);
        if (pass == null) pass = "";
        String database = resolveProp("DB_NAME", dbName);
        if (database == null || database.isBlank()) database = "patient_portal";

        boolean isMySql = "3306".equals(port)
                || ("localhost".equalsIgnoreCase(host) && ("root".equalsIgnoreCase(user) || "3306".equals(port)));

        if (isMySql) {
            String activePort = (port != null && !port.isBlank()) ? port : "3306";
            String activeUser = (user != null && !user.isBlank()) ? user : "root";
            String jdbcUrl = "jdbc:mysql://" + host + ":" + activePort + "/" + database
                    + "?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";

            logger.info("Configuring MySQL DataSource at {}:{} for database '{}'", host, activePort, database);
            config.setJdbcUrl(jdbcUrl);
            config.setUsername(activeUser);
            config.setPassword(pass);
            config.setDriverClassName("com.mysql.cj.jdbc.Driver");
        } else {
            // Default to PostgreSQL (Standard Render, Supabase, Neon environment)
            String activePort = (port != null && !port.isBlank()) ? port : "5432";
            String activeUser = (user != null && !user.isBlank()) ? user : "postgres";
            String jdbcUrl = "jdbc:postgresql://" + host + ":" + activePort + "/" + database;

            logger.info("Configuring PostgreSQL DataSource at {}:{} for database '{}'", host, activePort, database);
            config.setJdbcUrl(jdbcUrl);
            config.setUsername(activeUser);
            config.setPassword(pass);
            config.setDriverClassName("org.postgresql.Driver");
        }

        configureHikariPool(config);
        return new HikariDataSource(config);
    }

    private void configureHikariPool(HikariConfig config) {
        config.setConnectionTimeout(30000); // 30 seconds
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(600000); // 10 minutes
        config.setMaxLifetime(1800000); // 30 minutes
    }

    private String resolveProp(String key, String fallbackSpringVal) {
        String sysProp = System.getProperty(key);
        if (sysProp != null && !sysProp.isBlank()) return sysProp.trim();
        String sysEnv = System.getenv(key);
        if (sysEnv != null && !sysEnv.isBlank()) return sysEnv.trim();
        if (fallbackSpringVal != null && !fallbackSpringVal.isBlank()) return fallbackSpringVal.trim();
        return null;
    }

    private String resolveFirstProp(String[] keys, String... fallbacks) {
        for (String k : keys) {
            String val = resolveProp(k, null);
            if (val != null && !val.isBlank()) return val;
        }
        for (String fb : fallbacks) {
            if (fb != null && !fb.isBlank()) return fb.trim();
        }
        return null;
    }
}
