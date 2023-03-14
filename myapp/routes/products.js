var express = require('express');
var router = express.Router();
var mysql = require('../bin/mysql.js');
var moment = require('moment');
var fs = require('fs');
var multiparty = require('multiparty');//引入multiparty模块用于上传图片



router.get('/', function (req, res, next) {

    // session里一定要有user才有userName
    var userName = req.session.user?.userName;
    if (userName) {

        mysql.connPool.getConnection(function (err, connection) {
            //查询用户所有设备
            connection.query(
                'SELECT light.`name`,light.id,light.state,light.date FROM `user`,light WHERE `user`.userName = ? AND `user`.uid = light.uid UNION ' +
                'SELECT dht11.`name`,dht11.id,dht11.state,dht11.date FROM `user`,dht11 WHERE `user`.userName = ? AND `user`.uid = dht11.uid'

                , [userName, userName], function (err, data) {
                    if (err) {
                        throw err;
                    } else if (data.length > 0) {


                        for (var p in data) {
                            data[p].date = moment(data[p].date).format('YYYY-MM-DD');
                        }
                        //查询用户所有设备种类
                        connection.query('SELECT light,dht11 FROM category WHERE userName = ?', [userName], function (err, result) {
                            if (err) {
                                throw err;
                            } else if (result.length > 0) {
                                res.render('products', { user: req.session.user, light: data, category: result });
                            } else {
                                res.render('products', { user: req.session.user, light: null, category: null });
                            }
                        })
                    } else {
                        res.render('products', { user: req.session.user, light: null, category: null });
                    }
                });
            connection.release();

        });
    } else {
        res.render('products', { user: req.session.user, light: null, category: null });
    }
});

//有用户才能添加设备
router.get('/add-product', function (req, res, next) {
    if (req.session.user) {
        res.render('add-product', { user: req.session.user });
    } else {
        res.send('<script>alert("请先登录！");history.back()</script>');
    }
});

//添加设备
router.post('/add-product', function (req, res, next) {

    var userName = req.session.user.userName;

    var form = new multiparty.Form();//实例化

    //上传的图片保存在public里的upload,注意路径一定不能错
    form.uploadDir = 'public/upload';
    form.parse(req, function (err, fields, files) {
        var id = fields.stock[0];
        var name = fields.name[0];
        var category = fields.category[0];
        var date = new Date();
        var pic = files.pic[0].path;
        var selectSql = null;
        var insertSql = null;
        var user_devSql = null;
        var devSql = null;
        // console.log(files);

        var stats = fs.statSync(pic);
        var fileSizeInBytes = stats.size;

        if(fileSizeInBytes === 0){
            fs.unlinkSync(pic);//删除为空的设备图片
        }

        switch (category) {
            case '1':
                insertSql = 'INSERT INTO light VALUE (?,?,?,"off",0,?,?)';
                cateSql = 'update category set light = light+1 where userName = ?';
                break;
            case '2':
                insertSql = 'INSERT INTO dht11 VALUE (?,?,?,"off",0,?,?)';
                cateSql = 'update category set dht11 = dht11+1 where userName = ?';
                break;
            default: break;
        }

        selectSql = 'SELECT id FROM dev WHERE id = ? ';
        devSql = 'INSERT INTO dev VALUE (?,?,?)';
        user_devSql = 'INSERT INTO user_dev_id VALUE (?,?)';

        mysql.connPool.getConnection(function (err, connection) {

            //查询用户id
            connection.query(
                'SELECT user.uid FROM user WHERE userName = ? '

                , [userName], uid = function (err, userId) {
                    if (err) {
                        throw err;
                    } else {
                        let uid = userId[0].uid;

                        //查询设备号是否存在
                        connection.query(selectSql, [id], function (err, result) {
                            if (err) {
                                throw err;
                            } else if (result.length > 0) {
                                res.write('<head><meta charset="utf-8"/></head>');
                                res.write('<script>alert("添加失败，请确保设备号正确且唯一！");</script>');
                                res.write('<script>location.href="/products"</script>');
                            } else {
                                //增加设备数量
                                connection.query(cateSql, [userName], function (err, data) {
                                    if (err) {
                                        throw err;
                                    }
                                });
                                connection.query(devSql, [id, uid, category], function (err, data) {
                                    if (err) {
                                        throw err;
                                    }
                                });
                                connection.query(user_devSql, [uid, id], function (err, data) {
                                    if (err) {
                                        throw err;
                                    }
                                });
                                //插入设备数据
                                connection.query(insertSql, [id, uid, name, date, pic], function (err, data) {
                                    if (err) {
                                        throw err;
                                    } else {
                                        res.write('<head><meta charset="utf-8"/></head>');
                                        res.write('<script>alert("添加成功！");</script>');
                                        res.write('<script>location.href="/products"</script>');
                                    }
                                });
                            }
                        });
                    }
                });


            connection.release();
        })

    });
});


//删除设备
router.post('/del-product', function (req, res, next) {
    var id = req.body.id;

    var userName = req.session.user.userName;

    var selectSql = 'SELECT category FROM dev WHERE id = ? ';
    var cateSql = null;

    mysql.connPool.getConnection(function (err, connection) {

        connection.query(selectSql, [id], function (err, data) {
            if (err) {
                throw err;
            } else {
                switch (data[0].category) {
                    case '1':
                        cateSql = 'update category set light = light-1 where userName = ?';
                        break;
                    case '2':
                        cateSql = 'update category set dht11 = dht11-1 where userName = ?';
                        break;
                    default: break;
                }

                connection.query(cateSql, [userName], function (err, data) {
                    if (err) {
                        throw err;
                    }
                });
                connection.query('DELETE FROM dev WHERE id = ? ', [id], function (err, result) {
                    if (err) {
                        throw err;
                    } else{
                        res.send('删除成功！');
                    }
                });
            }
        });
        connection.release();
    });
});


module.exports = router;