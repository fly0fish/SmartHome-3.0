var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//引入ejs模板
const ejs=require('ejs');
//引入session模块
const session = require('cookie-session');

var index = require('./routes/index');
var login = require('./routes/login');
var report = require('./routes/report');
var products = require('./routes/products');
var accounts = require('./routes/accounts');
var usersRouter = require('./routes/users');

var app = express();

//设置express框架使用ejs模板引擎
//修改ejs模板后缀为html 
app.set('views', path.join(__dirname, '/views'));
app.engine('html', require('ejs').__express);  
app.set('view engine', 'html');

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static('public'));
app.use(session({
  keys: ['secret'],
  maxAge: 1000*60*30,
  resave: false,
  saveUninitialized: true
}));

app.use('/', login);
app.use('/index',index);
app.use('/login',login);
app.use('/report',report);
app.use('/products',products);
app.use('/accounts',accounts);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(err);
});

module.exports = app;
