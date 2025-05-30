-- Healthcare Organizations Table
CREATE TABLE IF NOT EXISTS HealthcareOrganization (
    organizationID INT PRIMARY KEY AUTO_INCREMENT,
    organizationName VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(50),
    latestWaitTimeSubmissionID INT,
    FOREIGN KEY (latestWaitTimeSubmissionID) REFERENCES WaitTimeSubmission(submissionID)
);

-- Wait time submission 
CREATE TABLE IF NOT EXISTS WaitTimeSubmission (
    submissionID INT PRIMARY KEY AUTO_INCREMENT,
    organizationID INT NOT NULL,
    waitTime INT NOT NULL,
    submissionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    submittedBy ENUM('organization', 'patient') NOT NULL,
    ipAddress VARCHAR(45), -- Only filled when submitted by patient
    FOREIGN KEY (organizationID) REFERENCES HealthcareOrganization(organizationID)
);