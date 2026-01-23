import { pgTable, serial, text, timestamp, varchar, boolean, integer, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userTypeEnum = pgEnum('user_type', ['client', 'tech']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'cancelled', 'completed', 'no_show']);
export const dayOfWeekEnum = pgEnum('day_of_week', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  userType: userTypeEnum('user_type').notNull(),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tech profiles
export const techProfiles = pgTable('tech_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  businessName: varchar('business_name', { length: 255 }),
  location: varchar('location', { length: 255 }),
  bio: text('bio'),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  totalReviews: integer('total_reviews').default(0),
  phoneNumber: varchar('phone_number', { length: 50 }),
  website: varchar('website', { length: 255 }),
  instagramHandle: varchar('instagram_handle', { length: 100 }),
  tiktokHandle: varchar('tiktok_handle', { length: 100 }),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Services
export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  techProfileId: integer('tech_profile_id').references(() => techProfiles.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }),
  duration: integer('duration'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tech availability
export const techAvailability = pgTable('tech_availability', {
  id: serial('id').primaryKey(),
  techProfileId: integer('tech_profile_id').references(() => techProfiles.id).notNull(),
  dayOfWeek: dayOfWeekEnum('day_of_week').notNull(),
  startTime: varchar('start_time', { length: 5 }).notNull(),
  endTime: varchar('end_time', { length: 5 }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tech time off
export const techTimeOff = pgTable('tech_time_off', {
  id: serial('id').primaryKey(),
  techProfileId: integer('tech_profile_id').references(() => techProfiles.id).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Bookings
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => users.id),
  techProfileId: integer('tech_profile_id').references(() => techProfiles.id).notNull(),
  serviceId: integer('service_id').references(() => services.id).notNull(),
  appointmentDate: timestamp('appointment_date').notNull(),
  duration: integer('duration').notNull(),
  status: bookingStatusEnum('status').default('pending').notNull(),
  clientNotes: text('client_notes'),
  servicePrice: decimal('service_price', { precision: 10, scale: 2 }).notNull(),
  serviceFee: decimal('service_fee', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  paymentStatus: varchar('payment_status', { length: 50 }).default('pending'),
  guestEmail: varchar('guest_email', { length: 255 }),
  guestPhone: varchar('guest_phone', { length: 50 }),
  guestName: varchar('guest_name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tech websites
export const techWebsites = pgTable('tech_websites', {
  id: serial('id').primaryKey(),
  techProfileId: integer('tech_profile_id').references(() => techProfiles.id).notNull().unique(),
  subdomain: varchar('subdomain', { length: 100 }).notNull().unique(),
  isPublished: boolean('is_published').default(true),
  primaryColor: varchar('primary_color', { length: 7 }).default('#1A1A1A'),
  secondaryColor: varchar('secondary_color', { length: 7 }).default('#8B7355'),
  accentColor: varchar('accent_color', { length: 7 }).default('#F5F5F5'),
  fontFamily: varchar('font_family', { length: 100 }).default('Inter'),
  seoTitle: varchar('seo_title', { length: 255 }),
  seoDescription: text('seo_description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sessions
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  token: varchar('token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  techProfile: one(techProfiles, {
    fields: [users.id],
    references: [techProfiles.userId],
  }),
  sessions: many(sessions),
}));

export const techProfilesRelations = relations(techProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [techProfiles.userId],
    references: [users.id],
  }),
  services: many(services),
  availability: many(techAvailability),
  timeOff: many(techTimeOff),
  bookings: many(bookings),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  techProfile: one(techProfiles, {
    fields: [services.techProfileId],
    references: [techProfiles.id],
  }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  client: one(users, {
    fields: [bookings.clientId],
    references: [users.id],
  }),
  techProfile: one(techProfiles, {
    fields: [bookings.techProfileId],
    references: [techProfiles.id],
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));
