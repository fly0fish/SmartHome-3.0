var express = require('express');
var router = express.Router();
var mysql = require('../bin/mysql.js');
var moment = require('moment');
var fs = require('fs');
const path = require('path');//引入nodejs路径模块
var multiparty = require('multiparty');//引入multiparty模块用于上传图片

router.get('/', function (req, res, next) {

  if (req.session.user) {
  

  var userName = req.session.user.userName;

  mysql.connPool.getConnection(function (err, connection) {

    //查询用户信息和照片
    connection.query(
        'SELECT sex,birthday,phone,email,image FROM user_data WHERE userName = ? '

        , [userName], uid = function (err, result) {
            if(err){//判断用户是否有照片
              throw err;
            }else{
              if(result[0].image){
                var imagePath = path.join(result[0].image);
                var fixedPath = imagePath.slice(7); // 去掉路径中'public/'，express访问images可直接访问
              }else{
                var fixedPath = null;
              }
              if(result[0].birthday){
                result[0].birthday = moment(result[0].birthday).format('MM/DD/YYYY');
              }
              console.log(result)

              res.render('accounts', { user: req.session.user,inform: result,img: fixedPath });
            }
        });
    });

  } else {
    res.send('<script>alert("请先登录！");history.back()</script>');
  }

});

//存储用户图片
router.post('/update-image', function (req, res, next) {

  var userName = req.session.user.userName;

  var form = new multiparty.Form();//实例化

  //上传的图片保存在images里的userImg,注意路径一定不能错
  form.uploadDir = 'public/images/userImg';
  form.parse(req, function (err, fields, files) {

    var pic = files.pic[0].path;

    mysql.connPool.getConnection(function (err, connection) {

      connection.query(
        'SELECT image FROM user_data WHERE userName = ? '

        , [userName], uid = function (err, result) {
            if(err){//判断用户是否有照片
              throw err;
            }else if(result.length > 0){
              var imagePath = path.join(result[0].image);
              fs.unlinkSync(imagePath);//删除旧图片
            }
          });

      //存储用户照片
      connection.query(
          'update user_data set image = ? where userName = ?'

          , [pic,userName], uid = function (err, result) {
              if(err){
                throw err;
              }else{
                res.write('<head><meta charset="utf-8"/></head>');
                res.write('<script>alert("上传成功！");</script>');
                res.write('<script>location.href="/accounts"</script>');
              }
          });
      });
  });
});

//存储用户信息
router.post('/update-inform', function (req, res, next) {

  var userName = req.session.user.userName;

  var newPwd = req.body.password;
  var sex = req.body.sex;
  var birthday = req.body.date;
  var phone = req.body.phone;
  var email = req.body.email;

  if(!newPwd){//判断用户有没有进行修改密码操作
    newPwd = req.session.user.userPwd;
  }

  const [month, day, year] = birthday.split('/');
  const formattedDate = `${year}-${month}-${day}`; // 将 '03/14/2023' 转换为 '2023-03-14'

  mysql.connPool.getConnection(function (err, connection) {

    //存储用户信息
    connection.query(
        'update user_data set sex = ?,birthday = ?,phone = ?,email = ? where userName = ?;'+
        'update user set userPwd = ? where userName = ?;'

        , [sex,formattedDate,phone,email,userName,newPwd,userName], uid = function (err, result) {
            if(err){
              throw err;
            }else{
              res.write('<head><meta charset="utf-8"/></head>');
              res.write('<script>alert("修改成功！");</script>');
              res.write('<script>location.href="/accounts"</script>');
            }
        });
    });

  
});


//删除用户
router.get('/del-user', function (req, res, next) {

  var userName = req.session.user.userName;

  mysql.connPool.getConnection(function (err, connection) {

      connection.query('DELETE FROM `user` WHERE userName = ?;', [userName], function (err, result) {
          if (err) {
              throw err;
          } else {
            res.send('删除成功！');
          }
      });
      connection.release();
  });
});


module.exports = router;