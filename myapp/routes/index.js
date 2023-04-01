var express = require('express');
var router = express.Router();
var mysqlDb = require('../bin/mysql');
var tcpServer = require('../bin/tcp-server.js');
var path = require('path');
var moment = require('moment');



router.get('/', function (req, res, next) {

  var userName = req.session.user?.userName;

  if (userName) {
    //查询用户dht11设备
    mysqlDb.mysql.dbClient.query(
      'SELECT dht11.id FROM `user`,dht11 WHERE `user`.userName = ? AND `user`.uid = dht11.uid;'

      , [userName], function (err, data) {
        if (err) {
          throw err;
        } else if (data.length > 0) {
          // console.log(data);
          const equipmentId = data[0].id;

          res.redirect(`/index/equipmentId/${equipmentId}`);
        } else {
          res.render('index', { user: req.session.user, dht: null, light: null, mq2: null, swi: null, air: null, mode: null });
        }
      });
  } else {
    // console.log(user);
    res.render('index', { user: null, dht: null, light: null, mq2: null, swi: null, air: null, mode: null });
  }

});

// 显示某设备数据
// GET /equipmentId/id
router.get('/equipmentId/:id', function (req, res, next) {

  var userName = req.session.user?.userName;

  var id = req.params.id;//获取路由中的设备id

  if (userName) {
    //查询用户温湿度,灯光数据
    mysqlDb.mysql.dbClient.query(
      'SELECT tem,hum                                           FROM dht11_data     WHERE devId = ? ORDER BY id DESC LIMIT 1;' +
      'SELECT light.id,light.name,light.state,light.status      FROM `user`,light   WHERE `user`.userName = ? AND `user`.uid = light.uid;' +
      'SELECT mq2.id,mq2.name,mq2.state,mq2.status              FROM `user`,mq2     WHERE `user`.userName = ? AND `user`.uid = mq2.uid;' + 
      'SELECT switch.id,switch.name,switch.state,switch.status  FROM `user`,switch  WHERE `user`.userName = ? AND `user`.uid = switch.uid;' + 
      'SELECT acandhum.acmode,acandhum.hummode                  FROM acandhum       WHERE userName = ?;'+
      'SELECT mode                                              FROM mode           WHERE userName = ?;'

      , [id, userName,userName,userName,userName,userName], function (err, data) {
        if (err) {
          throw err;
        } else {
          console.log(data);
          res.render('index', { user: req.session.user, dht: data[0], light: data[1], mq2: data[2], swi: data[3], air: data[4] ,mode: data[5]});
        }
      });
  } else {
    res.redirect('/index');
  }
});

router.get('/logoff', function (req, res, next) {
  //销毁session
  // console.log(req.session);
  delete req.session.user;

  res.redirect('/login');

});

router.get('/report', function (req, res, next) {
  res.render('report');
});

router.get('/login', function (req, res, next) {
  res.render('login');
});

/*获取连接设备列表 */
router.get('/equipment-list', function (req, res, next) {
  const list = []
  tcpServer.equipmentArray.forEach(equipment => {
    const data = {
      id: equipment.id,
      addr: equipment.addr
    }
    list.push(data)
  })
  res.send({ code: 0, data: list })
});

// 获取某设备的历史数据
// GET /history/123456 取得设备id为12356的数据。
router.get('/history/:id', function (req, res, next) {
  var tablename = "dev"
  mysql.find(tablename, (err, docs) => {
    if (err) {
      res.send([])
      console.log(err)
    }
    else {
      let result = []
      docs.forEach((doc) => {
        result.push({
          time: moment(doc.date).format('mm:ss'),
          value: doc.socket
        })
      });
      result.reverse()

      res.send(result)
    }

  })
});

// 向某设备发送温度设定
router.post('/dht/:id', function (req, res, next) {
  var userName = req.session.user?.userName;
  if(userName){

    mysqlDb.mysql.dbClient.query(
      'SELECT id FROM acandhum WHERE userName = ?;'

      , [userName], function (err, data) {
        if (err) {
          throw err;
        } else if(data.length > 0) {
          console.log()
        }else{
          var upSql = 'INSERT INTO acandhum (id,userName,acmode,hummode) VALUES(0,?,0,0)'
              mysqlDb.mysql.insert(upSql,userName,function(err,result){
                if(err){
                  console.log('增加空调失败')
                }
              });
        }
      });

    console.log('post /dht/:id - ', req.params.id, req.body)
    tcpServer.sentCommand(req.params.id, 'set', req.body,userName)
    res.send('设置已保存')
  }else{
    res.send('请先登录')
  }
  
})

// 向某设备发送 开/关 LED命令
router.post('/light/:id', function (req, res, next) {
  var userName = req.session.user?.userName;
  var lightId = req.body.id;
  if(req.body.comm === 'open'){
    var upSql = 'update light set status = "on" where id = ?';
  }else{
    var upSql = 'update light set status = "off" where id = ?';
  }

  mysqlDb.mysql.update(upSql,lightId,function(err,result){
    if(err){
      console.log('修改light状态失败')
    }
  });
  console.log('post /light - ', req.params.id, req.body)
  tcpServer.sentCommand(req.params.id, 'light', req.body,userName)
  res.send({ code: 0, msg: '命令已发送' })
})

// 向某设备发送 开/关 door命令
router.post('/door/:id', function (req, res, next) {
  var userName = req.session.user?.userName;
  var doorId = req.body.id;
  if(req.body.comm === 'open'){
    var upSql = 'update switch set status = "on" where id = ?';
  }else{
    var upSql = 'update switch set status = "off" where id = ?';
  }

  mysqlDb.mysql.update(upSql,doorId,function(err,result){
    if(err){
      console.log('修改door状态失败')
    }
  });
  console.log('post /door - ', req.params.id, req.body)
  tcpServer.sentCommand(req.params.id, 'door', req.body,userName)
  res.send({ code: 0, msg: '命令已发送' })
})

// 控制模式
router.post('/mode/:id', function (req, res, next) {
  var userName = req.session.user?.userName;

  // var upSql = 'update `user`,switch,light set switch.status = "off",light.status = "off" where `user`.userName = ? AND `user`.uid = switch.uid AND `user`.uid = switch.uid';

  // mysqlDb.mysql.update(upSql,userName,function(err,result){
  //   if(err){
  //     console.log('修改旅行状态失败')
  //   }
  // });

  var setmode = 'update mode set mode = ? where userName = ? ';

  mysqlDb.mysql.update(setmode,[req.body.mode,userName],function(err,result){
    if(err){
      console.log('修改旅行状态失败')
    }
  });

  // var closesql =  'SELECT light.id      FROM `user`,light   WHERE `user`.userName = ? AND `user`.uid = light.uid UNION' +
  //                 'SELECT switch.id     FROM `user`,switch  WHERE `user`.userName = ? AND `user`.uid = switch.uid;'

  // mysqlDb.mysql.update(closesql,[userName,userName],function(err,result){
  //   if(err){
  //     console.log('修改旅行状态失败')
  //   }else if(result.length > 0){
  //     for (var p in result) {

  //       tcpServer.sentCommand(req.params.id, 'outmode',{id:result[p].id,comm:'close'},userName)
  //       res.send({ code: 0, msg: '命令已发送' })
  //     }
      


  //   }
  // });

  if(req.body.mode === 1){
  	var date = new Date();
		mysqlDb.mysql.insertLog([userName,'开启旅行模式',date]);
  }else if(req.body.mode === 2){
    var date = new Date();
		mysqlDb.mysql.insertLog([userName,'开启回家模式',date]);
  }else{
    var date = new Date();
		mysqlDb.mysql.insertLog([userName,'手动模式',date]);
  }

  res.send({ code: 0, msg: 'success' })
  
})


module.exports = router;
