var express = require('express');
var router = express.Router();
var path = require('path');
var mysql = require('../bin/mysql.js')

router.get('/', function (req, res, next) {

    res.render('report',{user: req.session.user});

});

module.exports = router;