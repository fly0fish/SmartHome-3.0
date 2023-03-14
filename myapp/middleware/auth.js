module.exports = {
    // 用户登录中间件，从session中读取用户

    getUser: (req, res, next) =>{
        req.user = req.session.user
        next()
    }
}