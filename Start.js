var express = require('express');

var app = express.createServer(express.logger());

app.configure(function() {
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
    // Register ejs as .html
    app.register('.html', require('ejs'));
    // Optional since express defaults to CWD/views
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function()
{
     app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// Dummy users
var users = [
    { name: 'user 1', email: 'asdas@asdasd.com' },
    { name: 'user 2', email: 'asdasd@asd.com' },
    { name: 'user 3', email: 'asd.asd@sd.com' }
];

app.get('/', function(req, res){
  res.render('home', { users: users });
});

app.get('/socket', function(req, res){
  res.render('socket');
});

app.use(function(req, res, next){
    res.render('404', { status: 404, url: req.url });
});

app.use(function(err, req, res, next){
    res.render('500', 
    {
        status: err.status || 500,
        error: err
    });
});

var port = process.env.PORT || process.env.C9_PORT || 80;

app.listen(port, function() {
    var addr = app.address();
    console.log('app listening on http://' + addr.address + ':' + addr.port);
});

var io = require('socket.io').listen(app);

// defining a function
var findDatabyIP = function(val, callback){
    val.authorized = true;
    process.nextTick(function(){
        callback(null, val);
    });
};

io.configure(function (){
  io.set('authorization', function (handshakeData, callback) {
    // findDatabyip is an async example function
    findDatabyIP(handshakeData, function (err, data) {
      if (err) return callback(err);

      if (data.authorized) {
        handshakeData.foo = 'bar';
        for(var prop in data) handshakeData[prop] = data[data];
        callback(null, true);
      } else {
        callback(null, false);
      }
    }); 
  });
});

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});