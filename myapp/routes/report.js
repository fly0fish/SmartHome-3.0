var express = require('express');
var router = express.Router();
var path = require('path');
var moment = require('moment');
var mysqlDb = require('../bin/mysql.js')

router.get('/', function (req, res, next) {

    var userName = req.session.user?.userName;

    if (userName) {
        //查询用户dht11设备
        mysqlDb.mysql.dbClient.query(
            'SELECT log,date FROM `user_log` WHERE userName = ?;'

            , [userName], function (err, data) {
                if (err) {
                    throw err;
                } else if (data.length > 0) {
                    // console.log(data);
                    for (var p in data) {
                        data[p].date = moment(data[p].date).format('YYYY-MM-DD');
                    }
                    console.log(data)
                    res.render('report', { user: req.session.user,log: data });
                } else {
                    res.render('report', { user: req.session.user, log: null });
                }
            });
    } else {
        // console.log(user);
        res.render('report', { user: req.session.user,log: null });
    }
});

module.exports = router;