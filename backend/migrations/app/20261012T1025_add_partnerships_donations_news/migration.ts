#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/75a89651d6154b186a0d836e39bb7e4af3310c13486f8d3509d396c4b524bf59/contract';
import endContract from '../../snapshots/75a89651d6154b186a0d836e39bb7e4af3310c13486f8d3509d396c4b524bf59/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/b613c6cafdbc60085460ae352e19aa323e2ec2e32dc3eed5e85df4ad2c15251b/contract';
import startContract from '../../snapshots/b613c6cafdbc60085460ae352e19aa323e2ec2e32dc3eed5e85df4ad2c15251b/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'Donation',
        columns: [
          col('amountMinor', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('campaignId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('currency', 'text', {
            notNull: true,
            default: lit('ETB'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('donorName', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isAnonymous', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('message', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('phone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('reference', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING_PAYMENT'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'DonationCampaign',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('currency', 'text', {
            notNull: true,
            default: lit('ETB'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('description', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('endsAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('goalAmountMinor', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('imageAssetId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('imageUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('isPublished', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('startsAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
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
        table: 'DonationPayment',
        columns: [
          col('amountMinor', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('currency', 'text', {
            notNull: true,
            default: lit('ETB'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('donationId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('failureCode', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('failureMessage', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('idempotencyKey', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('mode', 'text', {
            notNull: true,
            default: lit('DEMO'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('provider', 'text', {
            notNull: true,
            default: lit('DEMO'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('providerTransactionId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('reference', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('verifiedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'NewsArticle',
        columns: [
          col('authorName', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('category', 'text', {
            notNull: true,
            default: lit('General'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('content', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('coverImageAssetId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('coverImageUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('excerpt', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('publishedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('DRAFT'),
            codecRef: { codecId: 'pg/text@1' },
          }),
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
        table: 'PartnershipRequest',
        columns: [
          col('city', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('contactPerson', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('country', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('organizationName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('organizationType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('partnershipType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('phone', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('proposal', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('reference', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('reviewNotes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('reviewedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('reviewedBy', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'ApplicationDocument',
        column: col('cloudinaryDeliveryType', 'text', {
          notNull: true,
          default: lit('authenticated'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'ApplicationDocument',
        column: col('partnershipRequestId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'Donation',
        constraint: 'Donation_reference_key',
        columns: ['reference'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'DonationCampaign',
        constraint: 'DonationCampaign_slug_key',
        columns: ['slug'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'DonationPayment',
        constraint: 'DonationPayment_reference_key',
        columns: ['reference'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'DonationPayment',
        constraint: 'DonationPayment_idempotencyKey_key',
        columns: ['idempotencyKey'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'DonationPayment',
        constraint: 'DonationPayment_providerTransactionId_key',
        columns: ['providerTransactionId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'NewsArticle',
        constraint: 'NewsArticle_slug_key',
        columns: ['slug'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'PartnershipRequest',
        constraint: 'PartnershipRequest_reference_key',
        columns: ['reference'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ApplicationDocument',
        index: 'ApplicationDocument_partnershipRequestId_idx_199f2794',
        columns: ['partnershipRequestId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Donation',
        index: 'Donation_campaignId_idx_3aacd648',
        columns: ['campaignId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'DonationPayment',
        index: 'DonationPayment_donationId_idx_dea7c586',
        columns: ['donationId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Donation',
        foreignKey: {
          name: 'Donation_campaignId_fkey',
          columns: ['campaignId'],
          references: { schema: 'public', table: 'DonationCampaign', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'DonationPayment',
        foreignKey: {
          name: 'DonationPayment_donationId_fkey',
          columns: ['donationId'],
          references: { schema: 'public', table: 'Donation', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ApplicationDocument',
        foreignKey: {
          name: 'ApplicationDocument_partnershipRequestId_fkey',
          columns: ['partnershipRequestId'],
          references: { schema: 'public', table: 'PartnershipRequest', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
