
# Project Database Setup: MSSQL

This document outlines the complete process for setting up the database structure for this project. The architecture uses a hybrid model:

-   **Microsoft SQL Server (MSSQL):** For all structured, relational data such as users, incidents, and their relationships. This ensures data integrity and consistency.
    

## 1. Database Design & Normalization (Datenbankdesign & Normalformen)

The MSSQL schema is designed to be robust and efficient by adhering to database normalization principles.

### Schema Overview

-   **Users**: Stores user credentials and admin rights.
    
-   **Incidents**: The core table for tracking security or operational incidents.
    
-   **Conclusion_Definitions**: A lookup table for predefined incident conclusions (e.g., "Malware", "False Positive").
    
-   **Incident_Links**: A linking table to create many-to-many relationships between incidents.
    

### Normalization (Normalformen)

The schema is in the **Third Normal Form (3NF)** and also satisfies the **Boyce-Codd Normal Form (BCNF)**.

-   **1NF (First Normal Form):** All column values are atomic. This is met.
    
-   **2NF (Second Normal Form):** There are no partial dependencies on a composite primary key. This is met as tables with composite keys (`Incident_Links`) have no non-key attributes.
    
-   **3NF (Third Normal Form):** There are no transitive dependencies. We avoid this by using foreign keys (`OwnerID`, `ConclusionID`) instead of storing redundant data like usernames or conclusion texts directly in the `Incidents` table.
    

## 2. Setup Instructions

These steps will guide you through creating the database structure from scratch.

### Step 2.1: MSSQL Table Creation

Run the following T-SQL script in a query tool like DataGrip or SQL Server Management Studio (SSMS) to create all necessary tables.

```
-- =================================================================
-- Table for Users
-- =================================================================
CREATE TABLE Users (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARBINARY(256) NOT NULL,
    PasswordSalt VARBINARY(256) NOT NULL,
    Is_Admin BIT NOT NULL DEFAULT 0
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

```
    

## 3. Optional: Populating with Example Data

### Step 3.1: Add Sample Data to MSSQL

This script adds users and conclusions, then creates and links several incidents.

#### Fix Applied: Resolving "Must declare the scalar variable" Error

The initial script failed because the `GO` command acts as a batch separator, causing variable scopes to be lost. The corrected script removes intermediate `GO` commands, allowing all variables to be accessed within a single batch.

```
-- Create Users (Example)
INSERT INTO Users (Username, PasswordHash, PasswordSalt, Is_Admin) VALUES
('niklas', 0xHASH, 0xSALT, 1),
('sebastian', 0xHASH, 0xSALT, 0),
('michael', 0xHASH, 0xSALT, 1),
('laura', 0xHASH, 0xSALT, 0);

-- Create Conclusion Definitions
INSERT INTO Conclusion_Definitions ([Text], IsTruePositive, IsInformational) VALUES
('Malware Infection', 1, 0),
('User Error / Phishing Click', 1, 0),
('Security Testing', 0, 1),
('False Positive', 0, 1);

-- Get User and Conclusion IDs
DECLARE @niklas_id INT, @sebastian_id INT, @michael_id INT, @laura_id INT;
SELECT @niklas_id = ID FROM Users WHERE Username = 'niklas';
SELECT @sebastian_id = ID FROM Users WHERE Username = 'sebastian';
SELECT @michael_id = ID FROM Users WHERE Username = 'michael';
SELECT @laura_id = ID FROM Users WHERE Username = 'laura';

DECLARE @malware_id INT, @phishing_id INT, @false_positive_id INT;
SELECT @malware_id = Conclusion_ID FROM Conclusion_Definitions WHERE [Text] = 'Malware Infection';
SELECT @phishing_id = Conclusion_ID FROM Conclusion_Definitions WHERE [Text] = 'User Error / Phishing Click';
SELECT @false_positive_id = Conclusion_ID FROM Conclusion_Definitions WHERE [Text] = 'False Positive';

-- Insert Incidents
INSERT INTO Incidents (OwnerID, CreatorID, Title, API_Text, Severity, [Status], Notes_Text, ConclusionID) VALUES
(@niklas_id, @michael_id, 'Virus detected on Server XYZ', '{ "hostname": "SERVER-XYZ" }', 3, 3, 'Resolved.', @malware_id),
(@laura_id, @laura_id, 'Phishing Email Reported from Finance Dept', '{ "reporter": "dave.cfo@example.com" }', 2, 3, 'Matches malware vector.', @phishing_id),
(@sebastian_id, @niklas_id, 'Server DB-01 running slow', '{ "metric": "CPU_Usage", "value": "95%" }', 3, 2, 'Investigating.'),
(@michael_id, @michael_id, 'False Positive: Apache Vulnerability on Web-03', '{ "vulnerability_id": "CVE-2024-12345" }', 1, 3, @false_positive_id);

-- Link Incidents
DECLARE @malware_incident_id INT, @phishing_incident_id INT;
SELECT @malware_incident_id = ID FROM Incidents WHERE Title = 'Virus detected on Server XYZ';
SELECT @phishing_incident_id = ID FROM Incidents WHERE Title LIKE 'Phishing Email Reported%';

IF @malware_incident_id IS NOT NULL AND @phishing_incident_id IS NOT NULL
BEGIN
    INSERT INTO Incident_Links (Main_IncidentID, Sub_IncidentID) VALUES
    (@malware_incident_id, @phishing_incident_id);
END
GO

```

### Step 3.2: Upload Sample Profile Pictures to MongoDB

Use the `mongofiles` tool to upload pictures. The `userID` in the metadata must match the `ID` from the MSSQL `Users` table.

#### Fix Applied: Resolving "unknown option metadata" Error

This error occurred because an outdated version of `mongofiles` was being used. The fix was to properly install the latest `mongodb-database-tools` package as described in Step 2.2.

**Example Commands:** (Ensure you have image files like `niklas.jpg` in your current directory)

```
# Get User IDs from MSSQL first: SELECT ID, Username FROM Users;
# Assume Niklas is ID 1, Laura is ID 4, etc.

# Upload for Niklas (ID 1)
mongofiles --uri="mongodb://localhost:27017" --db="user_profiles" put "./niklas.jpg" --metadata='{ "userID": 1, "contentType": "image/jpeg" }'

# Upload for Laura (ID 4)
mongofiles --uri="mongodb://localhost:27017" --db="user_profiles" put "./laura.png" --metadata='{ "userID": 4, "contentType": "image/png" }'

```

## 4. Verification

### Step 4.1: Verify MSSQL Data

Run `SELECT` queries in DataGrip to confirm the data was inserted.

```
SELECT i.ID, i.Title, owner.Username AS Owner, creator.Username AS Creator
FROM Incidents i
JOIN Users owner ON i.OwnerID = owner.ID
JOIN Users creator ON i.CreatorID = creator.ID;

SELECT * FROM Incident_Links;

```

### Step 4.2: Verify MongoDB Data

#### Fix Applied: Collections Not Visible in DataGrip

If the `profile_pictures.files` and `profile_pictures.chunks` collections are not visible in the DataGrip Database Explorer, a manual refresh is needed.

1.  Right-click the MongoDB data source or the `user_profiles` database.
    
2.  Select **Refresh** or **Synchronize**.
    

Then, run a query in the DataGrip console for the `user_profiles` database to see the file metadata.

```
// List all collections to confirm they exist
db.getCollectionNames();

// Find metadata for a specific user's picture
db.profile_pictures.files.findOne({ "metadata.userID": 1 });

```
