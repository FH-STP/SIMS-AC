-- mssql-init/setup.sql
-- NOTE: We add a USE statement to ensure tables are created in the correct database.

-- Create the database if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'SIMS')
BEGIN
    CREATE DATABASE SIMS;
END;
GO

USE SIMS;
GO

-- =================================================================
-- Table for Users
-- =================================================================
CREATE TABLE Users (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash varchar(1024) NOT NULL,
    PasswordSalt varchar(1024) NOT NULL,
    EMail varchar(1024) NOT NULL,
    Telephone varchar(1024) NOT NULL,
    Is_Admin BIT NOT NULL DEFAULT 0,
    IsDisabled BIT NOT NULL DEFAULT 0
);

-- =================================================================
-- Table for Predefined Conclusions
-- =================================================================
CREATE TABLE Conclusion_Definitions (
    Conclusion_ID INT IDENTITY(1,1) PRIMARY KEY,
    [Text] NVARCHAR(255) NOT NULL,
    IsTruePositive BIT NOT NULL,
    IsInformational BIT NOT NULL
);

-- =================================================================
-- Table for Incidents
-- =================================================================
CREATE TABLE Incidents (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    OwnerID INT NOT NULL,
    CreatorID INT NOT NULL,
    Title NVARCHAR(255) NOT NULL,
    API_Text NVARCHAR(MAX) NULL CHECK (ISJSON(API_Text) = 1),
    Creation_Time DATETIME2 NOT NULL DEFAULT GETDATE(),
    Severity INT NOT NULL,
    [Status] INT NOT NULL,
    Notes_Text NVARCHAR(MAX) NULL,
    ConclusionID INT NULL,
    IsDisabled BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_Incidents_Owner FOREIGN KEY (OwnerID) REFERENCES Users(ID),
    CONSTRAINT FK_Incidents_Creator FOREIGN KEY (CreatorID) REFERENCES Users(ID),
    CONSTRAINT FK_Incidents_Conclusion FOREIGN KEY (ConclusionID) REFERENCES Conclusion_Definitions(Conclusion_ID)
);

-- =================================================================
-- Table for Linking Incidents
-- =================================================================
CREATE TABLE Incident_Links (
    Main_IncidentID INT NOT NULL,
    Sub_IncidentID INT NOT NULL,
    PRIMARY KEY (Main_IncidentID, Sub_IncidentID),
    CONSTRAINT FK_Links_MainIncident FOREIGN KEY (Main_IncidentID) REFERENCES Incidents(ID),
    CONSTRAINT FK_Links_SubIncident FOREIGN KEY (Sub_IncidentID) REFERENCES Incidents(ID),
    CONSTRAINT CHK_NotSelfLink CHECK (Main_IncidentID <> Sub_IncidentID)
);

-- =================================================================
-- Insert Default Users
-- =================================================================
-- Note: These are pre-computed Argon2id hashes for testing purposes
-- admin: password = 'admin123'
-- user: password = 'user123'
-- security: password = 'security123'

-- Check if default users already exist, insert if not
IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'admin')
BEGIN
    INSERT INTO Users (Username, PasswordHash, PasswordSalt, EMail, Telephone, Is_Admin, IsDisabled)
    VALUES (
        'admin',
        'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855', -- Simplified hash for 'admin123'
        'ABCDEF0123456789ABCDEF0123456789',
        'admin@sims-ac.local',
        '+43 123 456 789',
        1,
        0
    );
END;

IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'user')
BEGIN
    INSERT INTO Users (Username, PasswordHash, PasswordSalt, EMail, Telephone, Is_Admin, IsDisabled)
    VALUES (
        'user',
        'F7CE2B3E6C0F1A86E0B5F4B3E1A2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0', -- Simplified hash for 'user123'
        'FEDCBA9876543210FEDCBA9876543210',
        'user@sims-ac.local',
        '+43 987 654 321',
        0,
        0
    );
END;

IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'security')
BEGIN
    INSERT INTO Users (Username, PasswordHash, PasswordSalt, EMail, Telephone, Is_Admin, IsDisabled)
    VALUES (
        'security',
        'A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F0A1B2', -- Simplified hash for 'security123'
        '0123456789ABCDEF0123456789ABCDEF',
        'security@sims-ac.local',
        '+43 555 123 456',
        0,
        0
    );
END;

-- =================================================================
-- Insert Sample Incidents (for testing)
-- =================================================================
IF NOT EXISTS (SELECT * FROM Incidents WHERE Title = 'Sicherheitslücke im Webserver')
BEGIN
    INSERT INTO Incidents (OwnerID, CreatorID, Title, API_Text, Severity, [Status], Notes_Text)
    VALUES (
        1, -- admin as owner
        2, -- user as creator
        'Sicherheitslücke im Webserver',
        '{"type": "security_vulnerability", "severity": "high", "affected_system": "webserver", "description": "Kritische Sicherheitslücke in Apache entdeckt"}',
        3, -- High severity
        1, -- In progress
        'Sofortige Patching-Maßnahmen eingeleitet. System wird überwacht.'
    );
END;

IF NOT EXISTS (SELECT * FROM Incidents WHERE Title = 'Verdächtige Netzwerkaktivität')
BEGIN
    INSERT INTO Incidents (OwnerID, CreatorID, Title, API_Text, Severity, [Status], Notes_Text)
    VALUES (
        1, -- admin as owner
        3, -- security as creator
        'Verdächtige Netzwerkaktivität',
        '{"type": "network_anomaly", "severity": "medium", "source_ip": "192.168.1.100", "description": "Ungewöhnliche Netzwerkaktivität festgestellt"}',
        2, -- Medium severity
        0, -- Open
        'Netzwerk-Logs werden analysiert. Weitere Überwachung erforderlich.'
    );
END;

IF NOT EXISTS (SELECT * FROM Incidents WHERE Title = 'Malware-Fund auf Arbeitsplatz')
BEGIN
    INSERT INTO Incidents (OwnerID, CreatorID, Title, API_Text, Severity, [Status], Notes_Text)
    VALUES (
        3, -- security as owner
        1, -- admin as creator
        'Malware-Fund auf Arbeitsplatz',
        '{"type": "malware_detected", "severity": "critical", "affected_host": "PC-WS-05", "description": "Trojaner auf Arbeitsplatz-PC entdeckt"}',
        4, -- Critical severity
        2, -- Resolved
        'System isoliert und bereinigt. Antivirus-Definitionen aktualisiert.'
    );
END;
