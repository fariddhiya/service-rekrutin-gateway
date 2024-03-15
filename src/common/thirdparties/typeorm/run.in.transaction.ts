import { DataSource, EntityManager } from 'typeorm';
import { lockmode } from './runner.lock.mode';

export const runInTransaction = async <T>(
  ds: DataSource,
  fn: (entityManager: EntityManager) => Promise<T>,
): Promise<T> => {
  const queryRunner = ds.createQueryRunner('master');

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const entityManager: EntityManager = queryRunner.manager;
    const result: T = await fn(entityManager);

    await queryRunner.commitTransaction();
    return result;
  } catch (err) {
    await queryRunner.rollbackTransaction();
    return Promise.reject(err);
  } finally {
    await queryRunner.release();
  }
};

/**
 * A type representing a runner object, used to execute database transactions.
 */
export type Runner = {
  /**
   * The TypeORM EntityManager used to execute transactions.
   */
  manager: EntityManager;

  lock_mode?: lockmode | undefined;
};
