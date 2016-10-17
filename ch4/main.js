var express = require('express');
var app = express();
var handlebars = require('express3-handlebars')
	.create({ defaultLayout:'main'});//设置默认布局文件
var m_data = require('./lib/m_data.js');
var m_weatherData = require('./lib/weatherData.js');
var formidable = require('formidable');
var jqupload = require('jquery-file-upload-middleware');

// 使用模板
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
//设置端口
app.set('port', process.env.PORT || 3000);
//使用静态文件
app.use(express.static(__dirname+'/public'));

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
//用jquery插件文件上传页面
app.use('/upload', function(req, res,next) {
	var now = new Date();
	jqupload.fileHandler({
		uploadDir: function(){
			return __dirname+'/public/uploads/'+ now
		},
		uploadUrl: function(){
			return '/uploads/'+ now;
		}
	})(req, res, next);
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
		console.log(fileds);
		console.log(files);
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