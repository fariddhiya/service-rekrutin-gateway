export enum lockmode {
  /**
   * An optional string representing the lock mode to use when executing the transaction. Possible values are:
   * - `pessimistic_read`: Acquires shared locks on the affected rows.
   * - `pessimistic_write`: Acquires exclusive locks on the affected rows.
   * - `dirty_read`: Reads the data without acquiring any locks.
   * - `pessimistic_partial_write`: Acquires row-level locks on some rows and table-level locks on others.
   * - `pessimistic_write_or_fail`: Acquires exclusive locks on the affected rows and fails the transaction if any of the rows are already locked.
   * - `for_no_key_update`: Acquires row-level locks on the affected rows without blocking other transactions from reading.
   * - `for_key_share`: Acquires shared locks on the affected rows without blocking other transactions from reading or updating.
   */

  pessimistic_read = 'pessimistic_read',
  pessimistic_write = 'pessimistic_write',
  dirty_read = 'dirty_read',
  pessimistic_partial_write = 'pessimistic_partial_write',
  pessimistic_write_or_fail = 'pessimistic_write_or_fail',
  for_no_key_update = 'for_no_key_update',
  for_key_share = 'for_key_share',
}
