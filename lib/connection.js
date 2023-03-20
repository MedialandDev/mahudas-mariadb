const mariadb = require('mariadb');
const DATABASE = Symbol('Mahudas#MariadbDatabase');
const CONNECTION = Symbol('Mahudas#MariadbConnection');

module.exports = async (app) => {
    const config = app.config.mariadb;
    this[DATABASE] = mariadb.createPool(config);
    // this[DATABASE].on('connection', (conn) => {
    //     console.log(conn.status);
    // });
    const query = async (query, values, transactionConn = null) => {
        if(config.showQuery) {
            app.coreLogger.debug(`\x1B[37m▉ Mariadb Query\n${query}\n----------------\n`, values, '\x1B[0m');
        }

        if(!this[CONNECTION] && !transactionConn) {
            this[CONNECTION] = await this[DATABASE].getConnection();
        } else if(transactionConn) {
            this[CONNECTION] = transactionConn;
        }

        try {
            return await this[CONNECTION].query(query, values);
        }catch (e) {
            if(!transactionConn && this[CONNECTION]) {
                await this[CONNECTION].end();
                this[CONNECTION] = null;
            }
            throw e;
        }finally {
            if(!transactionConn && this[CONNECTION]) {
                await this[CONNECTION].end();
                this[CONNECTION] = null;
            }
        }
    }

    this[DATABASE].get = async (queryString, values = []) => {
        const result = await query(queryString, values);
        return (Array.isArray(result)) ? result[0] : null;
    }

    this[DATABASE].find = async (queryString, values = []) => {
        return await query(queryString, values);
    }

    this[DATABASE].insert = async (tableName, data = {}, transactionConn = null) => {
        const columnName = `(${Object.keys(data).join(', ')})`;
        const valueString = `(${Array(Object.values(data).length).fill('?').join(', ')})`;
        const queryString = `INSERT INTO ${tableName} ${columnName} VALUES ${valueString}`;
        const result = await query(queryString, Object.values(data), transactionConn);

        return {status: result.affectedRows > 0, insertId: result.insertId};
    }

    this[DATABASE].update = async (tableName, updateData, where = {}, transactionConn = null) => {
        const updateColumnString = Object.keys(updateData).map((key) => {return `${key} = ?`}).join(', ');
        const updateValues = Object.values(updateData);
        const whereString = Object.keys(where).map((key) => {return `${key} = ?`}).join(' AND ');
        const whereValues = Object.values(where);

        const queryString = `UPDATE ${tableName} SET ${updateColumnString} WHERE ${whereString}`;

        const result = await query(queryString, [...updateValues, ...whereValues], transactionConn);

        return result.affectedRows > 0;
    }

    this[DATABASE].delete = async (tableName, where = {}, transactionConn = null) => {
        const whereString = Object.keys(where).map((key) => {return `${key} = ?`}).join(' AND ');
        const whereValues = Object.values(where);

        const queryString = `DELETE FROM ${tableName} WHERE ${whereString}`;

        const result =  await query(queryString, whereValues, transactionConn);

        return result.affectedRows > 0;
    }

    return this[DATABASE];
}