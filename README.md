# @mahudas/mariadb


## Dependencies
+ mahudas^0.1.2
+ mariadb^3.0.2


### As a plugin
如同一般的plugin，透過npm安裝之後，在Application的plugin.env.js裡設定啟用。

```console
npm i @mahudas/mariadb -s
```
```js
// config/plugin.deafult.js
module.exports = {
  mariadb: {
    enable: true,
    package: '@mahudas/mariadb',
  },
}
```

## 設定
```js
// config/config.default.js
module.exports = {
  mariadb: {
    host: '127.0.0.1',
    port: 3306,
    user: 'user',
    password: 'password',
    database: '',
    charset: 'utf8mb4',
    timezone: 'UTC+08:00',
    acquireTimeout: 20000,
  },
}
```
## 參數
請參考 [Mariadb Pool options](https://mariadb.com/kb/en/connector-nodejs-promise-api/#pool-options)

## Example
get 和 find, insert, update, delete 是擴充的 function
#### Get/Find
```js
// controller.js or service.js or middleware.js
await app.mariadb.get('SELECT NOW() AS currentTime;');
// > { currentTime: 2023-03-20T03:11:13.000Z }
await app.mariadb.find('SELECT NOW() AS currentTime;');
// > [{ currentTime: 2023-03-20T03:11:13.000Z }, meta: []]
```
#### Insert
```js
const insert_data = {
    foo: 'bar',
}
await app.mariadb.insert('table_name', insert_data);
// > { status: true, insertId: 1 }
```
#### Update
```js
const update_data = {
    foo: 'barU',
}
const where = {
    id: 1
}
await app.mariadb.update('table_name', update_data, where);
// > true
```
#### Delete
```js
const delete_where = {
    id: 1
}
await app.mariadb.delete('table_name', delete_where);
// > true
```
#### 一般使用
```js
// 要先取得 connection，在用 conn 去 query
// 最後記得要 conn.end();
const conn = await app.mariadb.getConnection();
try{
    return await conn.query('SELECT NOW() AS currentTime;');
}catch (e) {
    await conn.end();
    throw e;
}finally {
    await conn.end();
}
```
