#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/b613c6cafdbc60085460ae352e19aa323e2ec2e32dc3eed5e85df4ad2c15251b/contract';
import endContract from '../../snapshots/b613c6cafdbc60085460ae352e19aa323e2ec2e32dc3eed5e85df4ad2c15251b/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/e146fd55a5d48aaa6278eefb770b0245e1c40001c2e7a121fdc3a00316a7fd30/contract';
import startContract from '../../snapshots/e146fd55a5d48aaa6278eefb770b0245e1c40001c2e7a121fdc3a00316a7fd30/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'TutoringPayment',
        columns: [
          col('amount', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
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
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('paymentMode', 'text', {
            notNull: true,
            default: lit('DEMO'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('paymentReference', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('transactionId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('tutorApplicationId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'TutoringPayment',
        constraint: 'TutoringPayment_paymentReference_key',
        columns: ['paymentReference'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'TutoringPayment',
        constraint: 'TutoringPayment_transactionId_key',
        columns: ['transactionId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'TutoringPayment',
        index: 'TutoringPayment_tutorApplicationId_idx_cac902e5',
        columns: ['tutorApplicationId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'TutoringPayment',
        foreignKey: {
          name: 'TutoringPayment_tutorApplicationId_fkey',
          columns: ['tutorApplicationId'],
          references: { schema: 'public', table: 'TutorApplication', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
