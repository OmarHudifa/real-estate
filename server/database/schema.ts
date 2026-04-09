/*
const {
  pgTable,
  serial,
  varchar,
  text,
  float4,
  boolean,
  integer,
  timestamp,
  jsonb,
  pgEnum,
  array,
  unique,
  primaryKey
} = require('drizzle-orm/pg-core');*/

import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  real,
  pgEnum,
  primaryKey
} from 'drizzle-orm/pg-core';

// Enums
type Enum<T extends readonly string[]> = T[number];

export const highlightEnum = pgEnum('highlight', [
  'HighSpeedInternetAccess',
  'WasherDryer',
  'AirConditioning',
  'Heating',
  'SmokeFree',
  'CableReady',
  'SatelliteTV',
  'DoubleVanities',
  'TubShower',
  'Intercom',
  'SprinklerSystem',
  'RecentlyRenovated',
  'CloseToTransit',
  'GreatView',
  'QuietNeighborhood'
]);

export const amenityEnum = pgEnum('amenity', [
  'WasherDryer',
  'AirConditioning',
  'Dishwasher',
  'HighSpeedInternet',
  'HardwoodFloors',
  'WalkInClosets',
  'Microwave',
  'Refrigerator',
  'Pool',
  'Gym',
  'Parking',
  'PetsAllowed',
  'WiFi'
]);

export const propertyTypeEnum = pgEnum('property_type', [
  'Rooms',
  'Tinyhouse',
  'Apartment',
  'Villa',
  'Townhouse',
  'Cottage'
]);

export const applicationStatusEnum = pgEnum('application_status', [
  'Pending',
  'Denied',
  'Approved'
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'Pending',
  'Paid',
  'PartiallyPaid',
  'Overdue'
]);

// Tables
export const property = pgTable('property', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  pricePerMonth: real('pricePerMonth').notNull(),
  securityDeposit: real('securityDeposit').notNull(),
  applicationFee: real('applicationFee').notNull(),
  photoUrls: varchar('photoUrls', { length: 1024 }).array(),
  amenities: amenityEnum().array(),
  highlights: highlightEnum().array(),
  isPetsAllowed: boolean('isPetsAllowed').default(false),
  isParkingIncluded: boolean('isParkingIncluded').default(false),
  beds: integer('beds').notNull(),
  baths: real('baths').notNull(),
  squareFeet: integer('squareFeet').notNull(),
  propertyType: propertyTypeEnum('propertyType').notNull(),
  postedDate: timestamp('postedDate', { withTimezone: true }).defaultNow(),
  averageRating: real('averageRating').default(0),
  numberOfReviews: integer('numberOfReviews').default(0),
  locationId: integer('locationId').notNull(),
  managerCognitoId: varchar('managerCognitoId', { length: 255 }).notNull()
});

export const manager = pgTable('manager', {
  id: serial('id').primaryKey(),
  cognitoId: varchar('cognitoId', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phoneNumber: varchar('phoneNumber', { length: 255 }).notNull()
});

export const tenant = pgTable('tenant', {
  id: serial('id').primaryKey(),
  cognitoId: varchar('cognitoId', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phoneNumber: varchar('phoneNumber', { length: 255 }).notNull()
});

export const location = pgTable('location', {
  id: serial('id').primaryKey(),
  address: varchar('address', { length: 255 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  postalCode: varchar('postalCode', { length: 20 }).notNull(),
  coordinates: text('coordinates').notNull() // PostGIS support placeholder
});

export const application = pgTable('application', {
  id: serial('id').primaryKey(),
  applicationDate: timestamp('applicationDate', { withTimezone: true }).notNull(),
  status: applicationStatusEnum('status').notNull(),
  propertyId: integer('propertyId').notNull(),
  tenantCognitoId: varchar('tenantCognitoId', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phoneNumber: varchar('phoneNumber', { length: 255 }).notNull(),
  message: text('message'),
  leaseId: integer('leaseId').unique()
});

export const lease = pgTable('lease', {
  id: serial('id').primaryKey(),
  startDate: timestamp('startDate', { withTimezone: true }).notNull(),
  endDate: timestamp('endDate', { withTimezone: true }).notNull(),
  rent: real('rent').notNull(),
  deposit: real('deposit').notNull(),
  propertyId: integer('propertyId').notNull(),
  tenantCognitoId: varchar('tenantCognitoId', { length: 255 }).notNull()
});

export const payment = pgTable('payment', {
  id: serial('id').primaryKey(),
  amountDue: real('amountDue').notNull(),
  amountPaid: real('amountPaid').notNull(),
  dueDate: timestamp('dueDate', { withTimezone: true }).notNull(),
  paymentDate: timestamp('paymentDate', { withTimezone: true }).notNull(),
  paymentStatus: paymentStatusEnum('paymentStatus').notNull(),
  leaseId: integer('leaseId').notNull()
});

// Junction Tables (many-to-many)
export const tenantFavorites = pgTable('tenant_favorites', {
  tenantId: integer('tenantId').notNull(),
  propertyId: integer('propertyId').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.tenantId, table.propertyId] })
}));

export const tenantProperties = pgTable('tenant_properties', {
  tenantId: integer('tenantId').notNull(),
  propertyId: integer('propertyId').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.tenantId, table.propertyId] })
}));