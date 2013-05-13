var express = require('express');
var fs = require('fs');
var app = express();

app.set('views', __dirname + '/pages');
app.configure(function(){
  app.use('/public',express.static(__dirname + '/public'));
}); 

app.get('/', function (req, res){ 
	fs.readFile('index.html', 'utf8', function(err, data) {
		res.end(data);
	});
});

app.get('/pages/:page.html', function(req, res) {
    var ispjax = req.headers["x-pjax"];
    var file = ispjax ? __dirname + "/pages/" + req.params.page + ".html" : "index.html";
 
    fs.readFile(file, 'utf8', function(err, data) {
		res.end(data);
	});		
});

app.listen(process.env.VCAP_APP_PORT || 3000);