/* 利用mysql数据库存储 */
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
let wktList = [['name', 'wkt']];

const mysql = require('mysql')
const connection = mysql.createConnection({
  host: 'graph.policegap.cn',
  user: 'haizhi',
  password: 'haizhi@123',
  // 端口, mysql 端口一般是3306
  port: 3306,
  // 数据库的名称
  database: 'map_test',
})

connection.connect(function (err) {
  if (err) {
    console.error('error connecting: ' + err)
    return
  }
  console.log('connected as id ' + connection.threadId)

  /* 增 */
  // const post = { name: 'test2', wkt: '' }
  // connection.query('INSERT INTO map_test.community SET ?', post, (err, results) => {
  //   if (err) {
  //     console.log('err', err)
  //   } else {
  //     console.log('新增成功')
  //   }
  // })
  /* 查 */
  // connection.query('SELECT * FROM map_test.community WHERE wkt IS NULL LIMIT 1,8', function (error, results, fields) {
  //   if (error) throw error
  //   console.log(results)
  // })
  /* 改 */
  // const post = { wkt: 2 }
  // connection.query('UPDATE map_test.community SET ? WHERE id = ?', [post, 1], (err, results) => {
  //   if (err) {
  //     console.log('err', err)
  //   } else {
  //     console.log('修改成功')
  //   }
  // })
})
/**
 * express允许跨域
 */
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'),
    res.header('Access-Control-Allow-Headers', ''),
    res.header('Access-Control-Allow-Method', 'PUT,POST,GET,DELETE,OPTIONS'),
    res.header('X-Powered-By', '3.2.1');
  if (req.method == 'OPTIONS') {
    res.send(200);
  } else {
    next();
  }
});

app.get('/api', function (req, res) {
  res.send('首页');
})

app.post('dologin', function (req, res) {
  console.log(req.body);
  res.json({ 'msg': 'post成功' });
})
app.post('/api/update', function (req, res) {
  const { id, wkt } = req.body
  console.log(id)
  const post = { wkt: wkt }
  connection.query('UPDATE map_test.community SET ? WHERE id = ?', [post, id], (err, results) => {
    if (err) {
      console.log('err', err)
    } else {
      console.log('修改成功')
      res.json({ 'msg': '修改成功' });
    }
  })
})
app.get('/api/names', function (req, res) {
  connection.query('SELECT * FROM map_test.community WHERE wkt IS NULL', function (error, results, fields) {
    if (error) throw error
    console.log(results)
    res.json({ 'data': results });
  })
})

app.listen(8888, '127.0.0.1', function () {
  console.log('服务已启动，请访问：http://127.0.0.1:8888')
});
