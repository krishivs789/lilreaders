CREATE TABLE IF NOT EXISTS "registrations" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"parentName" varchar(256) NOT NULL,
	"contactNumber" varchar(32) NOT NULL,
	"whatsappGroup" boolean DEFAULT false,
	"email" varchar(256),
	"homeAddress" text NOT NULL,
	"childName" varchar(256) NOT NULL,
	"dateOfBirth" varchar(64) NOT NULL,
	"schoolName" varchar(256) NOT NULL,
	"classGrade" varchar(64) NOT NULL,
	"emergencyInfo" text,
	"preferredBatch" varchar(128) NOT NULL,
	"readingLevel" varchar(256) NOT NULL,
	"parentExpectations" varchar(256) NOT NULL,
	"declarationAgreed" boolean NOT NULL,
	"parentSignature" varchar(256) NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
