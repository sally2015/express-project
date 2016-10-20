var args = 'its a arguments';//虚拟一个参数
function getWeatherData(){

	return {
		locations:[
			{
				name:'广州',
				forecastUrl:'https://github.com/sally2015',
				weather:'广州的温度情况',
				temp:'温度'
			},
			{
				name:'深圳',
				forecastUrl:'https://github.com/sally2015',
				weather:'深圳的温度情况',
				temp:'温度'
			},
			{
				name:'珠海',
				forecastUrl:'https://github.com/sally2015',
				weather:'珠海的温度情况',
				temp:'温度'
			}
		]
	}
}
exports.getData = function(){
	return args;
}

