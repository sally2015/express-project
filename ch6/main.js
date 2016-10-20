var express = require('express');
var app = express();
var handlebars = require('express3-handlebars')
	.create({ defaultLayout:'main'});//设置默认布局文件
var m_data = require('./lib/m_data.js');
var m_weatherData = require('./lib/weatherData.js');
var formidable = require('formidable');
var credential = require('./credentials.js');


// 使用模板
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
//设置端口
app.set('port', process.env.PORT || 3000);
//使用静态文件
app.use(express.static(__dirname+'/public'));
//设置cookie密钥s
app.use(require('cookie-parser')(credential.cookieSercret));
app.use(require('express-session')());

//如果有即显信息，把它传到上下文中，然后清除它
app.use(function(req, res, next){
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	
	next();
});
//定义中间件来检测查询字符串中的test=1
app.use(function(req, res, next){
	res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
	console.log(res.locals.showTests)
	next();
});
//给res.locals.weather添加数据
app.use(function(req, res, next){
	if(!res.locals.weather){
		res.locals.weather = {};

	}
	res.locals.weather = m_weatherData.getWeatherData();
	next();
});

//文件上传页面
app.get('/photoUpload', function(req, res) {
	var now = new Date();
	res.render('photoUpload',{
		year: now.getFullYear(),
		month: now.getMonth()
	});
});
//文件上传请求
app.post('/photoUpload/:year/:month',function(req, res){
	var form = new formidable.IncomingForm();
	form.parse(req,function(err,fileds,files){
		if(err) return res.redirect(303,'/error');
		res.redirect(303,'/thankyou');
	})
});
//使用body-parser使req.body可用
app.use(require('body-parser')());
//ajax 表单请求
app.post('/process',function(req, res){
	if(req.xhr || req.accepts('json,html') === 'json'){
		res.send({success:true});
	}else{
		res.redirect(303,'/thankyou');
	}
});
//form 表单页
app.get('/newsletter', function(req, res) {
	res.render('newsletter', {csrf:'csrf data'});
});
app.get('/newsletter/archive', function(req, res) {
	res.end('/newsletter/archive');
});
function NewsletterSignup(){

}
NewsletterSignup.prototype.save = function(cb){
	cb();
}
var VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

//即显消息表单
app.post('/newsletter',function(req, res){
	var name = req.body.name || '',email = req.body.email || '';
	console.log(req.body)
	console.log(email)
	//input validation
	if( !email.match(VALID_EMAIL_REGEX) ){
		if(req.xhr) return res.json({ error: 'invalid name email address'});
		req.session.flash = {
			type:'danger',
			intro:'validation error',
			message : "the email address you entered was not valid"
		}

		return res.redirect(303,'/newsletter/archive');
	}

	new NewsletterSignup({ name: name, email: email}).save(function(err){
		if (err) {
			if (req.xhr) return res.json({error:'databasse error'});
			req.session.flash = {
				type:'danger',
				intro:'database error',
				message : "there was a database error; please try again later"
			}
		};
		return res.redirect(303, '/newsletter/archive');
		if (req.xhr) return res.json({success:true});
		req.session.flash = {
			type:'success',
			intro:'Thank you',
			message : "you have been signed up for newsletter"
		}
		return res.redirect(303, '/newsletter/archive');
	});

});

//form 表单数据请求
// app.post('/process',function(req, res){
// 	console.log('Form (from querystring):'+req.query.form);
// 	console.log('name csrf'+req.body._csrf);
// 	console.log('name value' + req.body.name);
// 	console.log('email value' + req.body.email);
// 	res.redirect(303,'/thankyou');
// });
//表单跳转页
app.get('/thankyou', function(req, res) {
	res.send('thank you');
});
//表单error页
app.get('/error', function(req, res) {
	res.send('error');
});
//数据请求
app.get('/data/ajaxtest', function(req, res) {
	res.json({
			animal:'dog',
			bodyPart:'tail',
			adjective : 'sharp',
			noun : 'run'
		});
});


//设置路由
app.get('/', function(req, res) {
	console.log(req.cookies)
	res.cookie('test','iddi');
	res.render('home');
});
app.get('/about', function(req,res){
	
	res.render('about', {
		args:m_data.getData(),
		pageTestScript:'/qa/tests-about.js'
	});
});

// 404 catch-all handler (middleware)
app.use(function(req, res, next){
	res.status(404);
	res.render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

app.listen(app.get('port'), function(){
  console.log( 'Express started on http://localhost:' + 
    app.get('port') + '; press Ctrl-C to terminate.' );
});