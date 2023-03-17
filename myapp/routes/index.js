var express = require('express');
var router = express.Router();
var mysql = require('../bin/mysql');
var tcpServer = require('../bin/tcp-server.js');
var path = require ('path');
var moment = require('moment');



router.get('/',function(req, res, next) {

  var userName = req.session.user?.userName;

  if(userName){
    mysql.connPool.getConnection(function (err, connection) {
      //查询用户dht11设备
      connection.query(
          'SELECT dht11.id FROM `user`,dht11 WHERE `user`.userName = ? AND `user`.uid = dht11.uid;'

          , [userName], function (err, data) {
              if (err) {
                  throw err;
              } else if (data.length > 0) {
                console.log(data);
                const equipmentId = data[0].id;
                
                res.redirect(`/index/equipmentId/${equipmentId}`);
              }else{
                res.render('index',{user:req.session.user});
              }
          });
    });
  }else{
    // console.log(user);
    res.render('index',{user:null,dht: null});
  }
  
});

// 显示某设备数据
// GET /equipmentId/id
router.get('/equipmentId/:id', function(req, res, next) {

  var userName = req.session.user?.userName;

  var id = req.params.id;//获取路由中的设备id

  if(userName){
  mysql.connPool.getConnection(function (err, connection) {
    //查询用户温湿度
    connection.query(
        'SELECT tem,hum FROM dht11_data WHERE devId = ? ORDER BY id DESC LIMIT 1;'

        , [id], function (err, data) {
            if (err) {
                throw err;
            }else{
              console.log(data);
              res.render('index',{user: req.session.user,dht: data});
            }
        });
  });
  }else{
    res.redirect('/index');
  }
});

router.get('/logoff', function(req, res, next) {
  //销毁session
  console.log(req.session);
  delete req.session.user;
  
  res.redirect('/login'); 
  
});

router.get('/report', function(req, res, next) {
  res.render('report');
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

/*获取连接设备列表 */
router.get('/equipment-list', function(req, res, next) {
  const list = []
  tcpServer.equipmentArray.forEach(equipment=>{
    const data = {
      id:equipment.id,
      addr:equipment.addr
    }
    list.push(data)
  })
  res.send({code:0,data:list})
});


// router.get('/equipmentId/:id', function(req, res, next) {
//   // 默认是使用pug模板的，为了减少不必要的学习与降低入门门槛，改使用html。
//   res.sendFile('index.html',{root:path.join(__dirname , '../views')});
// });

// 获取某设备的历史数据
// GET /history/123456 取得设备id为12356的数据。
router.get('/history/:id', function(req, res, next) {
  var tablename = "dev"
  mysql.find(tablename,(err,docs)=>{
    if(err){
      res.send([])
      console.log(err)
    }
    else{
      let result = []
      docs.forEach( (doc) => {
        result.push({
          time:moment(doc.date).format('mm:ss'),
          value:doc.socket
        })
      });
      result.reverse()
      
      res.send(result)
    }
    
  })
});

// router.post('/index.html',function (req,res,next) {
//   console.log('post /index.html - ',req.params.id,req.body);
//   if(req.body.password == '111' ){
//   res.sendFile('index.html',{root:path.join(__dirname , '../views')});
//   }
//   else{
//     alert('账号或密码不正确！');
//   }
// })

// 向某设备发送 开/关 LED命令
router.post('/led/:id',function (req,res,next) {
  console.log('post /led/:id - ',req.params.id,req.body);
  tcpServer.sentCommand(req.params.id,req.body.action)
  res.send({code:0,msg:'命令已发送'})
})


module.exports = router;
