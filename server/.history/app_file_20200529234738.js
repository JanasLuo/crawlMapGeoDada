/* 利用excel存取数据 */
var express = require('express');
var fs = require('fs')
var xlsx = require('node-xlsx');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
let wktList = [['name', 'wkt']];
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

app.post('/api/update', function (req, res) {
  // console.log(req.body.name, req.body.wkt);
  const { name, wkt, len } = req.body
  if (wkt) {
    wktList.push([
      name,
      wkt
    ])
  }
  console.log('wktList', wktList)
  console.log('len', len)
  var sheetData = [
    {
      name: 'sheet1',
      data: [].concat(wktList)
    }
  ]
  saveXlsxFile(sheetData, 'polygon')
  // if (wktList.length >= len) {
  //   var sheetData = [
  //     {
  //       name: 'sheet1',
  //       data: [].concat(wktList)
  //     }
  //   ]
  //   saveXlsxFile(sheetData, 'polygon')
  // }

  res.json({ 'msg': '修改成功' });
})
app.get('/api/names', function (req, res) {
  var sheets = xlsx.parse('./names.xlsx');
  var datas = sheets[0].data
  var names = []
  datas.forEach((item, index) => {
    if (index !== 0) {
      names.push(item[0])
    }
  })
  // console.log('names', names)
  res.json({ 'data': names });
})

app.listen(8888, '127.0.0.1', function () {
  console.log('服务已启动，请访问：http://127.0.0.1:8888')
});

// 写入xlsx文件
function saveXlsxFile(sheetData, fileName) {
  // console.log('wktList2', sheetData[0].data)
  var buffer = xlsx.build(sheetData);
  fs.writeFile(`./${fileName}.xlsx`, buffer, function (err) {
    // wktList = [['name', 'wkt']];
    if (err) {
      console.log("Write failed: " + err);
      return;
    }
    console.log("Write completed.");
  });
}