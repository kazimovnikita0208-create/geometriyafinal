/**
 * Адаптер базы данных
 * Поддерживает работу как с SQLite (локально), так и с Supabase (на Vercel)
 */

const db = require('./database');
const { getSupabaseClient, isSupabaseEnabled } = require('./supabase');

// Определяем, какую БД использовать
const USE_SUPABASE = isSupabaseEnabled() || process.env.NODE_ENV === 'production';

/**
 * Универсальный интерфейс для работы с БД
 */
class DatabaseAdapter {
  constructor() {
    this.useSupabase = USE_SUPABASE;
    this.supabase = USE_SUPABASE ? getSupabaseClient() : null;
    this.sqlite = USE_SUPABASE ? null : db;
    
    if (USE_SUPABASE) {
      console.log('📦 Используется Supabase');
    } else {
      console.log('📦 Используется SQLite');
    }
  }

  /**
   * Выполнить SELECT запрос
   */
  async select(table, where = {}, options = {}) {
    if (this.useSupabase) {
      return this._selectSupabase(table, where, options);
    } else {
      return this._selectSQLite(table, where, options);
    }
  }

  /**
   * Выполнить INSERT запрос
   */
  async insert(table, data) {
    if (this.useSupabase) {
      return this._insertSupabase(table, data);
    } else {
      return this._insertSQLite(table, data);
    }
  }

  /**
   * Выполнить UPDATE запрос
   */
  async update(table, data, where) {
    if (this.useSupabase) {
      return this._updateSupabase(table, data, where);
    } else {
      return this._updateSQLite(table, data, where);
    }
  }

  /**
   * Выполнить DELETE запрос
   */
  async delete(table, where) {
    if (this.useSupabase) {
      return this._deleteSupabase(table, where);
    } else {
      return this._deleteSQLite(table, where);
    }
  }

  /**
   * Получить одну запись
   */
  async get(table, where) {
    if (this.useSupabase) {
      return this._getSupabase(table, where);
    } else {
      return this._getSQLite(table, where);
    }
  }

  /**
   * Получить все записи
   */
  async all(table, where = {}, options = {}) {
    return this.select(table, where, options);
  }

  // ========== Supabase методы ==========

  async _selectSupabase(table, where, options) {
    let query = this.supabase.from(table).select(options.select || '*');

    // Применяем условия WHERE
    Object.keys(where).forEach(key => {
      if (Array.isArray(where[key])) {
        query = query.in(key, where[key]);
      } else {
        query = query.eq(key, where[key]);
      }
    });

    // Сортировка
    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending !== false });
    }

    // Лимит
    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return data || [];
  }

  async _getSupabase(table, where) {
    let query = this.supabase.from(table).select('*').limit(1);

    Object.keys(where).forEach(key => {
      query = query.eq(key, where[key]);
    });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async _insertSupabase(table, data) {
    const { data: result, error } = await this.supabase
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase insert error: ${error.message}`);
    }

    return result;
  }

  async _updateSupabase(table, data, where) {
    let query = this.supabase.from(table).update(data);

    Object.keys(where).forEach(key => {
      query = query.eq(key, where[key]);
    });

    const { data: result, error } = await query.select().single();

    if (error) {
      throw new Error(`Supabase update error: ${error.message}`);
    }

    return result;
  }

  async _deleteSupabase(table, where) {
    let query = this.supabase.from(table).delete();

    Object.keys(where).forEach(key => {
      query = query.eq(key, where[key]);
    });

    const { error } = await query;

    if (error) {
      throw new Error(`Supabase delete error: ${error.message}`);
    }

    return true;
  }

  // ========== SQLite методы ==========

  _selectSQLite(table, where, options) {
    let sql = `SELECT ${options.select || '*'} FROM ${table}`;
    const params = [];

    if (Object.keys(where).length > 0) {
      const conditions = Object.keys(where).map((key, index) => {
        if (Array.isArray(where[key])) {
          const placeholders = where[key].map((_, i) => {
            params.push(where[key][i]);
            return '?';
          }).join(',');
          return `${key} IN (${placeholders})`;
        } else {
          params.push(where[key]);
          return `${key} = ?`;
        }
      });
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    if (options.orderBy) {
      sql += ` ORDER BY ${options.orderBy} ${options.ascending === false ? 'DESC' : 'ASC'}`;
    }

    if (options.limit) {
      sql += ` LIMIT ${options.limit}`;
    }

    return this.sqlite.prepare(sql).all(...params);
  }

  _getSQLite(table, where) {
    const conditions = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
    const values = Object.values(where);
    const sql = `SELECT * FROM ${table} WHERE ${conditions} LIMIT 1`;
    
    return this.sqlite.prepare(sql).get(...values) || null;
  }

  _insertSQLite(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    
    const stmt = this.sqlite.prepare(sql);
    const result = stmt.run(...values);
    
    // Получаем вставленную запись
    const inserted = this.sqlite.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(result.lastInsertRowid);
    return inserted;
  }

  _updateSQLite(table, data, where) {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
    const values = [...Object.values(data), ...Object.values(where)];
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    
    this.sqlite.prepare(sql).run(...values);
    
    // Получаем обновленную запись
    return this._getSQLite(table, where);
  }

  _deleteSQLite(table, where) {
    const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
    const values = Object.values(where);
    const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
    
    this.sqlite.prepare(sql).run(...values);
    return true;
  }

  /**
   * Выполнить произвольный SQL запрос (только для SQLite)
   */
  prepare(sql) {
    if (this.useSupabase) {
      throw new Error('Direct SQL queries are not supported with Supabase. Use adapter methods instead.');
    }
    return this.sqlite.prepare(sql);
  }
}

// Создаем единственный экземпляр адаптера
const adapter = new DatabaseAdapter();

module.exports = adapter;

