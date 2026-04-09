CREATE TYPE "public"."amenity" AS ENUM('WasherDryer', 'AirConditioning', 'Dishwasher', 'HighSpeedInternet', 'HardwoodFloors', 'WalkInClosets', 'Microwave', 'Refrigerator', 'Pool', 'Gym', 'Parking', 'PetsAllowed', 'WiFi');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('Pending', 'Denied', 'Approved');--> statement-breakpoint
CREATE TYPE "public"."highlight" AS ENUM('HighSpeedInternetAccess', 'WasherDryer', 'AirConditioning', 'Heating', 'SmokeFree', 'CableReady', 'SatelliteTV', 'DoubleVanities', 'TubShower', 'Intercom', 'SprinklerSystem', 'RecentlyRenovated', 'CloseToTransit', 'GreatView', 'QuietNeighborhood');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('Pending', 'Paid', 'PartiallyPaid', 'Overdue');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('Rooms', 'Tinyhouse', 'Apartment', 'Villa', 'Townhouse', 'Cottage');--> statement-breakpoint
CREATE TABLE "application" (
	"id" serial PRIMARY KEY NOT NULL,
	"applicationDate" timestamp with time zone NOT NULL,
	"status" "application_status" NOT NULL,
	"propertyId" integer NOT NULL,
	"tenantCognitoId" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phoneNumber" varchar(255) NOT NULL,
	"message" text,
	"leaseId" integer,
	CONSTRAINT "application_leaseId_unique" UNIQUE("leaseId")
);
--> statement-breakpoint
CREATE TABLE "lease" (
	"id" serial PRIMARY KEY NOT NULL,
	"startDate" timestamp with time zone NOT NULL,
	"endDate" timestamp with time zone NOT NULL,
	"rent" real NOT NULL,
	"deposit" real NOT NULL,
	"propertyId" integer NOT NULL,
	"tenantCognitoId" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "location" (
	"id" serial PRIMARY KEY NOT NULL,
	"address" varchar(255) NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"country" varchar(100) NOT NULL,
	"postalCode" varchar(20) NOT NULL,
	"coordinates" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manager" (
	"id" serial PRIMARY KEY NOT NULL,
	"cognitoId" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phoneNumber" varchar(255) NOT NULL,
	CONSTRAINT "manager_cognitoId_unique" UNIQUE("cognitoId")
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" serial PRIMARY KEY NOT NULL,
	"amountDue" real NOT NULL,
	"amountPaid" real NOT NULL,
	"dueDate" timestamp with time zone NOT NULL,
	"paymentDate" timestamp with time zone NOT NULL,
	"paymentStatus" "payment_status" NOT NULL,
	"leaseId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"pricePerMonth" real NOT NULL,
	"securityDeposit" real NOT NULL,
	"applicationFee" real NOT NULL,
	"photoUrls" varchar(1024)[],
	"amenities" "amenity"[],
	"highlights" "highlight"[],
	"isPetsAllowed" boolean DEFAULT false,
	"isParkingIncluded" boolean DEFAULT false,
	"beds" integer NOT NULL,
	"baths" real NOT NULL,
	"squareFeet" integer NOT NULL,
	"propertyType" "property_type" NOT NULL,
	"postedDate" timestamp with time zone DEFAULT now(),
	"averageRating" real DEFAULT 0,
	"numberOfReviews" integer DEFAULT 0,
	"locationId" integer NOT NULL,
	"managerCognitoId" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant" (
	"id" serial PRIMARY KEY NOT NULL,
	"cognitoId" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phoneNumber" varchar(255) NOT NULL,
	CONSTRAINT "tenant_cognitoId_unique" UNIQUE("cognitoId")
);
--> statement-breakpoint
CREATE TABLE "tenant_favorites" (
	"tenantId" integer NOT NULL,
	"propertyId" integer NOT NULL,
	CONSTRAINT "tenant_favorites_tenantId_propertyId_pk" PRIMARY KEY("tenantId","propertyId")
);
--> statement-breakpoint
CREATE TABLE "tenant_properties" (
	"tenantId" integer NOT NULL,
	"propertyId" integer NOT NULL,
	CONSTRAINT "tenant_properties_tenantId_propertyId_pk" PRIMARY KEY("tenantId","propertyId")
);
