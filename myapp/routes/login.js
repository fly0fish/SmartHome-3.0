var express = require('express');
var router = express.Router();
var path = require('path');
var mysql = require('../bin/mysql.js')

router.get('/', function (req, res, next) {

    // 默认是使用pug模板的，为了减少不必要的学习与降低入门门槛，改使用html。
    // res.sendFile('login.html', { root: path.join(__dirname, '../views') });
    // res.type('html');

    res.render('login');

});

router.get('/register', function (req, res, next) {

    res.render('register');
});

router.post('/', function login(req, res) {

    var val = req.body;
    var userName = val.userName;
    var userPwd = val.userPwd;

    mysql.connPool.getConnection(function (err, connection) {

        connection.query('select * from user where userName = ? and userPwd = ?', [userName, userPwd], function (err, data) {
            if (err) {
                throw err;
            } else if (data.length > 0) {

                //session存储(key=value)(就是user=data结果)
                req.session.user = req.body

                res.redirect('/index');
            } else {
                res.send('<script>alert("用户名或密码错误！");history.back()</script>');
                // res.write('<head><meta charset="utf-8"/></head>');
                // res.write('<script>alert("您输入的账号或密码错误，请重新输入！");</script>');
                // res.write('<script>location.href="/login"</script>');
                // res.end('用户名或密码有误!');
            }
        })
        connection.release();
    });

});

router.post('/register', function login(req, res) {

    var val = req.body;
    var userName = val.userName;
    var userPwd = val.userPwd;

    mysql.connPool.getConnection(function (err, connection) {

        connection.query('select * from user where userName = ?', [userName], function (err, data) {
            if (err) {
                throw err;
            } else if (data.length > 0) {

                res.send('<script>alert("您输入的用户名已被注册，请重新输入！");history.back()</script>');

            } else {
                //添加新用户
                connection.query(
                    'INSERT INTO user(uid,userName,userPwd) VALUES(0,?,?);'+
                    'INSERT INTO category(id,userName) VALUES(0,?);'+
                    'INSERT INTO user_data(userName) VALUES(?);'
                , [userName, userPwd,userName,userName], function (err, result) {
                    if (err) {
                        res.send('<script>alert("注册失败，请联系管理员！");history.back()</script>');
                        throw err;
                    } else {
                        res.write('<head><meta charset="utf-8"/></head>');
                        res.write('<script>alert("注册成功,点击确认跳转登录！");</script>');
                        res.write('<script>location.href="/login"</script>');
                    }

                })
            }
        })
        connection.release();
    });

});

module.exports = router;