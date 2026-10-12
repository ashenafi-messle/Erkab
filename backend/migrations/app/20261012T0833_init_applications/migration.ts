#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/e146fd55a5d48aaa6278eefb770b0245e1c40001c2e7a121fdc3a00316a7fd30/contract';
import endContract from '../../snapshots/e146fd55a5d48aaa6278eefb770b0245e1c40001c2e7a121fdc3a00316a7fd30/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'ApplicationDocument',
        columns: [
          col('category', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('cloudinaryPublicId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('cloudinaryResourceType', 'text', {
            notNull: true,
            default: lit('raw'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('cloudinarySecureUrl', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('fileSize', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('fileType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('originalFilename', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('studentApplicationId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('trainerApplicationId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('tutorApplicationId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'ApplicationReview',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('decision', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('notes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('reviewerId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('reviewerName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('studentApplicationId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('trainerApplicationId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('tutorApplicationId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'StudentApplication',
        columns: [
          col('age', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('classCompletionYear', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('fullName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('gender', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('programId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('referenceNumber', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('telegramPhone', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'TrainerApplication',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('expertiseTrack', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('fullName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('portfolioUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('referenceNumber', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('teachingStatement', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('telegramPhone', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('yearsOfExperience', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'TrainingProgram',
        columns: [
          col('careerPaths', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('category', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('delivery', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('description', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('duration', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('image', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('imageAlt', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isPublished', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('modules', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('prerequisites', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('scholarship', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('skills', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('summary', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'TutorApplication',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('deliveryPreference', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('email', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('experience', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('gradeLevel', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('hourlyRate', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('locationDetails', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('parentOrContactPhone', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('qualifications', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('referenceNumber', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('studentOrApplicantName', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('subjects', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'StudentApplication',
        constraint: 'StudentApplication_referenceNumber_key',
        columns: ['referenceNumber'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'TrainerApplication',
        constraint: 'TrainerApplication_referenceNumber_key',
        columns: ['referenceNumber'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'TrainingProgram',
        constraint: 'TrainingProgram_slug_key',
        columns: ['slug'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'TutorApplication',
        constraint: 'TutorApplication_referenceNumber_key',
        columns: ['referenceNumber'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ApplicationDocument',
        index: 'ApplicationDocument_studentApplicationId_idx_9016b496',
        columns: ['studentApplicationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ApplicationDocument',
        index: 'ApplicationDocument_trainerApplicationId_idx_cc164910',
        columns: ['trainerApplicationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ApplicationDocument',
        index: 'ApplicationDocument_tutorApplicationId_idx_cac902e5',
        columns: ['tutorApplicationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ApplicationReview',
        index: 'ApplicationReview_studentApplicationId_idx_9016b496',
        columns: ['studentApplicationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ApplicationReview',
        index: 'ApplicationReview_trainerApplicationId_idx_cc164910',
        columns: ['trainerApplicationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ApplicationReview',
        index: 'ApplicationReview_tutorApplicationId_idx_cac902e5',
        columns: ['tutorApplicationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'StudentApplication',
        index: 'StudentApplication_programId_idx_4e50c706',
        columns: ['programId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ApplicationDocument',
        foreignKey: {
          name: 'ApplicationDocument_studentApplicationId_fkey',
          columns: ['studentApplicationId'],
          references: { schema: 'public', table: 'StudentApplication', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ApplicationDocument',
        foreignKey: {
          name: 'ApplicationDocument_trainerApplicationId_fkey',
          columns: ['trainerApplicationId'],
          references: { schema: 'public', table: 'TrainerApplication', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ApplicationDocument',
        foreignKey: {
          name: 'ApplicationDocument_tutorApplicationId_fkey',
          columns: ['tutorApplicationId'],
          references: { schema: 'public', table: 'TutorApplication', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ApplicationReview',
        foreignKey: {
          name: 'ApplicationReview_studentApplicationId_fkey',
          columns: ['studentApplicationId'],
          references: { schema: 'public', table: 'StudentApplication', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ApplicationReview',
        foreignKey: {
          name: 'ApplicationReview_trainerApplicationId_fkey',
          columns: ['trainerApplicationId'],
          references: { schema: 'public', table: 'TrainerApplication', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ApplicationReview',
        foreignKey: {
          name: 'ApplicationReview_tutorApplicationId_fkey',
          columns: ['tutorApplicationId'],
          references: { schema: 'public', table: 'TutorApplication', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'StudentApplication',
        foreignKey: {
          name: 'StudentApplication_programId_fkey',
          columns: ['programId'],
          references: { schema: 'public', table: 'TrainingProgram', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
