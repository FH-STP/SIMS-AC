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
-- Table for Logs
-- =================================================================
CREATE TABLE LogsSIMS (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    TextMessage NVARCHAR(100) NOT NULL,
    Creation_Time DATETIME2 NOT NULL DEFAULT GETDATE(),
    LogLevel INT NOT NULL
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
-- Insert Default Admin User
-- =================================================================
-- This ensures the 'admin' user with ID=1 always exists.

IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'admin')
BEGIN
    -- Temporarily allow explicit insertion into the IDENTITY column
    SET IDENTITY_INSERT Users ON;

    INSERT INTO Users (ID, Username, PasswordHash, PasswordSalt, EMail, Telephone, Is_Admin, IsDisabled)
    VALUES (
        1,                         -- Explicitly set ID
        'admin',                   -- Username
        '465C203B938A7906AF58B35D580B45E9E73762E2FEDCD614961B967F010CD1FA4D0F4DCD25E81AC45BAB235F672DFD412645895F1979D2B8CD5D0E0B05B0B43FAD4F93BAD5A0AF224F97CD4CF89E7846F172E4859296DC53D2A51489EE58E40A886556E669452DE18F0E356D3565B5F36582F6453BA78D4A58419051AC02CD63BCB63C9BCA8E473D19F7E777770DE0F5719F8EA5D5C4B97FFF874A97800A01E8A5AE14F9042416FCBBFF00E5AD3B2A3FA33CC17643DA457A4AFCEEBAD1B92955F8C9BCC67BCDB4DB5CB3833004593F8F8649377F7218D987D0589DB4F5CE5A61D972F7D06C9B785B99D1F6DBEE2E0BE16B6F2101B294AE741F942CA79402D770', -- PasswordHash
        'AB811831781EDC90A6E31A6B85A29A2F', -- PasswordSalt
        'placeholder@test.at',     -- Email
        '12345678',                -- Telephone
        1,                         -- Is_Admin = true
        0                          -- IsDisabled = false
    );

    -- Disable explicit insertion into the IDENTITY column
    SET IDENTITY_INSERT Users OFF;
END;
GO

-- =================================================================
-- Insert Default Conclusion Definitions
-- =================================================================
PRINT 'Populating Conclusion Definitions...';

-- Clear existing definitions to ensure a clean slate, then insert all.
IF EXISTS (SELECT * FROM Conclusion_Definitions)
BEGIN
    -- If you want to keep existing ones and only add new, remove this TRUNCATE line.
    TRUNCATE TABLE Conclusion_Definitions;
END;

INSERT INTO Conclusion_Definitions ([Text], IsTruePositive, IsInformational) VALUES
('System - Empty', 0, 0),
('False Positiv', 0, 0),
('False Positiv - Info', 0, 1),
('True Positiv - Scan', 1, 1),
('True Positiv - Info', 1, 1),
('True Positiv - Malware', 1, 0),
('True Positive - System Patched and Secured', 1, 0),
('True Positive - User Account Compromised and Reset', 1, 0),
('False Positive - Activity Confirmed as Normal', 0, 0),
('Informational - Logged for Threat Intelligence', 0, 1);
GO

-- =================================================================
-- Insert Sample Incidents
-- =================================================================
-- Severity: 1=Low, 2=Medium, 3=High, 4=Critical
-- Status: 1=New, 2=In Progress, 3=Closed
PRINT 'Populating Sample Incidents...';

IF NOT EXISTS (SELECT * FROM Incidents)
BEGIN
    -- Incident 1: Critical, New
    INSERT INTO Incidents (OwnerID, CreatorID, Title, API_Text, Creation_Time, Severity, [Status], Notes_Text, ConclusionID, IsDisabled)
    VALUES (1, 1, 'Malware Detected on ws-01', '{"hostname": "ws-01", "malware_signature": "Trojan.GenericKD.123"}', DATEADD(day, -1, GETDATE()), 4, 1, 'Initial alert from EDR system.', NULL, 0);

    -- Incident 2: High, In Progress
    INSERT INTO Incidents (OwnerID, CreatorID, Title, API_Text, Creation_Time, Severity, [Status], Notes_Text, ConclusionID, IsDisabled)
    VALUES (1, 1, 'Suspicious Login from Unusual IP', '{"source_ip": "198.51.100.50"}', DATEADD(hour, -5, GETDATE()), 3, 2, 'User has been contacted, awaiting response.', NULL, 0);

    -- Incident 3: Medium, Closed (False Positive)
    INSERT INTO Incidents (OwnerID, CreatorID, Title, API_Text, Creation_Time, Severity, [Status], Notes_Text, ConclusionID, IsDisabled)
    VALUES (1, 1, 'High CPU on srv-db-01', NULL, DATEADD(day, -3, GETDATE()), 2, 3, 'Correlated with scheduled maintenance window. Confirmed as normal activity.', 3, 0);
END;
GO
