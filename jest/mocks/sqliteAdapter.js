// In tests, the native (JSI/SQLite) adapter is unavailable. This stub
// implements WatermelonDB's DatabaseAdapter interface as a no-op, in-memory
// adapter so the database layer can be constructed and rendered without
// native bindings.
class TestDatabaseAdapter {
  constructor({ schema, migrations, dbName }) {
    this.schema = schema;
    this.migrations = migrations;
    this.dbName = dbName || 'test';
  }

  find(_table, _id, callback) {
    callback({ value: null });
  }

  query(_query, callback) {
    callback({ value: [] });
  }

  queryIds(_query, callback) {
    callback({ value: [] });
  }

  unsafeQueryRaw(_query, callback) {
    callback({ value: [] });
  }

  count(_query, callback) {
    callback({ value: 0 });
  }

  batch(_operations, callback) {
    callback({ value: undefined });
  }

  getDeletedRecords(_table, callback) {
    callback({ value: [] });
  }

  destroyDeletedRecords(_table, _recordIds, callback) {
    callback({ value: undefined });
  }

  unsafeLoadFromSync(_jsonId, callback) {
    callback({ value: undefined });
  }

  provideSyncJson(_id, _json, callback) {
    callback({ value: undefined });
  }

  unsafeResetDatabase(callback) {
    callback({ value: undefined });
  }

  unsafeExecute(_work, callback) {
    callback({ value: undefined });
  }

  getLocal(_key, callback) {
    callback({ value: undefined });
  }

  setLocal(_key, _value, callback) {
    callback({ value: undefined });
  }

  removeLocal(_key, callback) {
    callback({ value: undefined });
  }
}

module.exports = TestDatabaseAdapter;
module.exports.default = TestDatabaseAdapter;
