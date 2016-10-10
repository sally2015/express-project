var express = require('express');
var app = express();
var handlebars = require('express3-handlebars')
	.create({ defaultLayout:'main' });//设置默认布局文件

// 使用模板
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//使用静态文件
app.use(express.static(__dirname+'/public'));
//设置端口
app.set('port', process.env.PORT || 3000);

var args = 'its a arguments';//虚拟一个参数

//设置路由
app.get('/', function(req, res) {
	res.render('home');
});
app.get('/about', function(req,res){
	
	res.render('about', {args:args});
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
