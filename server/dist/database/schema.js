"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantProperties = exports.tenantFavorites = exports.payment = exports.lease = exports.application = exports.location = exports.tenant = exports.manager = exports.property = exports.paymentStatusEnum = exports.applicationStatusEnum = exports.propertyTypeEnum = exports.amenityEnum = exports.highlightEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.highlightEnum = (0, pg_core_1.pgEnum)('highlight', [
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
exports.amenityEnum = (0, pg_core_1.pgEnum)('amenity', [
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
exports.propertyTypeEnum = (0, pg_core_1.pgEnum)('property_type', [
    'Rooms',
    'Tinyhouse',
    'Apartment',
    'Villa',
    'Townhouse',
    'Cottage'
]);
exports.applicationStatusEnum = (0, pg_core_1.pgEnum)('application_status', [
    'Pending',
    'Denied',
    'Approved'
]);
exports.paymentStatusEnum = (0, pg_core_1.pgEnum)('payment_status', [
    'Pending',
    'Paid',
    'PartiallyPaid',
    'Overdue'
]);
// Tables
exports.property = (0, pg_core_1.pgTable)('property', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description').notNull(),
    pricePerMonth: (0, pg_core_1.real)('pricePerMonth').notNull(),
    securityDeposit: (0, pg_core_1.real)('securityDeposit').notNull(),
    applicationFee: (0, pg_core_1.real)('applicationFee').notNull(),
    photoUrls: (0, pg_core_1.varchar)('photoUrls', { length: 1024 }).array(),
    amenities: (0, exports.amenityEnum)().array(),
    highlights: (0, exports.highlightEnum)().array(),
    isPetsAllowed: (0, pg_core_1.boolean)('isPetsAllowed').default(false),
    isParkingIncluded: (0, pg_core_1.boolean)('isParkingIncluded').default(false),
    beds: (0, pg_core_1.integer)('beds').notNull(),
    baths: (0, pg_core_1.real)('baths').notNull(),
    squareFeet: (0, pg_core_1.integer)('squareFeet').notNull(),
    propertyType: (0, exports.propertyTypeEnum)('propertyType').notNull(),
    postedDate: (0, pg_core_1.timestamp)('postedDate', { withTimezone: true }).defaultNow(),
    averageRating: (0, pg_core_1.real)('averageRating').default(0),
    numberOfReviews: (0, pg_core_1.integer)('numberOfReviews').default(0),
    locationId: (0, pg_core_1.integer)('locationId').notNull(),
    managerCognitoId: (0, pg_core_1.varchar)('managerCognitoId', { length: 255 }).notNull()
});
exports.manager = (0, pg_core_1.pgTable)('manager', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    cognitoId: (0, pg_core_1.varchar)('cognitoId', { length: 255 }).notNull().unique(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull(),
    phoneNumber: (0, pg_core_1.varchar)('phoneNumber', { length: 255 }).notNull()
});
exports.tenant = (0, pg_core_1.pgTable)('tenant', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    cognitoId: (0, pg_core_1.varchar)('cognitoId', { length: 255 }).notNull().unique(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull(),
    phoneNumber: (0, pg_core_1.varchar)('phoneNumber', { length: 255 }).notNull()
});
exports.location = (0, pg_core_1.pgTable)('location', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    address: (0, pg_core_1.varchar)('address', { length: 255 }).notNull(),
    city: (0, pg_core_1.varchar)('city', { length: 100 }).notNull(),
    state: (0, pg_core_1.varchar)('state', { length: 100 }).notNull(),
    country: (0, pg_core_1.varchar)('country', { length: 100 }).notNull(),
    postalCode: (0, pg_core_1.varchar)('postalCode', { length: 20 }).notNull(),
    coordinates: (0, pg_core_1.text)('coordinates').notNull() // PostGIS support placeholder
});
exports.application = (0, pg_core_1.pgTable)('application', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    applicationDate: (0, pg_core_1.timestamp)('applicationDate', { withTimezone: true }).notNull(),
    status: (0, exports.applicationStatusEnum)('status').notNull(),
    propertyId: (0, pg_core_1.integer)('propertyId').notNull(),
    tenantCognitoId: (0, pg_core_1.varchar)('tenantCognitoId', { length: 255 }).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull(),
    phoneNumber: (0, pg_core_1.varchar)('phoneNumber', { length: 255 }).notNull(),
    message: (0, pg_core_1.text)('message'),
    leaseId: (0, pg_core_1.integer)('leaseId').unique()
});
exports.lease = (0, pg_core_1.pgTable)('lease', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    startDate: (0, pg_core_1.timestamp)('startDate', { withTimezone: true }).notNull(),
    endDate: (0, pg_core_1.timestamp)('endDate', { withTimezone: true }).notNull(),
    rent: (0, pg_core_1.real)('rent').notNull(),
    deposit: (0, pg_core_1.real)('deposit').notNull(),
    propertyId: (0, pg_core_1.integer)('propertyId').notNull(),
    tenantCognitoId: (0, pg_core_1.varchar)('tenantCognitoId', { length: 255 }).notNull()
});
exports.payment = (0, pg_core_1.pgTable)('payment', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    amountDue: (0, pg_core_1.real)('amountDue').notNull(),
    amountPaid: (0, pg_core_1.real)('amountPaid').notNull(),
    dueDate: (0, pg_core_1.timestamp)('dueDate', { withTimezone: true }).notNull(),
    paymentDate: (0, pg_core_1.timestamp)('paymentDate', { withTimezone: true }).notNull(),
    paymentStatus: (0, exports.paymentStatusEnum)('paymentStatus').notNull(),
    leaseId: (0, pg_core_1.integer)('leaseId').notNull()
});
// Junction Tables (many-to-many)
exports.tenantFavorites = (0, pg_core_1.pgTable)('tenant_favorites', {
    tenantId: (0, pg_core_1.integer)('tenantId').notNull(),
    propertyId: (0, pg_core_1.integer)('propertyId').notNull(),
}, (table) => ({
    pk: (0, pg_core_1.primaryKey)({ columns: [table.tenantId, table.propertyId] })
}));
exports.tenantProperties = (0, pg_core_1.pgTable)('tenant_properties', {
    tenantId: (0, pg_core_1.integer)('tenantId').notNull(),
    propertyId: (0, pg_core_1.integer)('propertyId').notNull(),
}, (table) => ({
    pk: (0, pg_core_1.primaryKey)({ columns: [table.tenantId, table.propertyId] })
}));
//# sourceMappingURL=schema.js.map