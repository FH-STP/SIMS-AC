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
