var fs = require('fs');
var url = require('url');
var http = require('http');
var WebSocket = require('ws');
var queryString = require('querystring');

var MongoClient = require('mongodb').MongoClient

var path = require('path');
//const { ok } = require('assert');
var db = []; //database
const PORT = 8080;
var clients = [];

let db_mongo;
var collection;

// Connect to db
MongoClient.connect("mongodb://localhost:27017",(err,client)=>{
    if(err){
        return console.log(err);
    }
    db_mongo = client.db("TTTN");
    collection = db_mongo.collection('temp_humid');
    console.log("Đã kết nối database");
})



// function gửi yêu cầu(response) từ phía server hoặc nhận yêu cầu (request) của client gửi lên
function requestHandler(request, response) {
    var filepath = './web' + request.url;
    if (filepath=="./web/")
        filepath = "./web/index.html";
    var extname = path.extname(filepath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
    }
    // Giả sử địa chỉ nhận được http://192.168.202.106:8080/update?temp=30&humd=40
    var uriData = url.parse(request.url);
    var pathname = uriData.pathname; // /update?
    var query = uriData.query; // temp=30.5&humd=40
    var queryData = queryString.parse(query) // queryData.temp = 30.5, queryData.humd = 40
    if (pathname=='/update') {
        var newData = {
            temp: queryData.temp,
            humd: queryData.humd,
            time: new Date()
        };
        db.push(newData);
        console.log(newData);
        
        collection.insertOne(newData, (err, result)=>{
            if(err){
                console.log(err);
            } else{
                console.log('Inserted new one into temp_humid collection');
            }
        })
        response.end();   
    } else if (pathname=='/get') {
        response.writeHead(200, {
                'Content-type': 'application/json'
            });
        response.end(JSON.stringify(db));
        db = [];
    } else if(pathname=='/data'){
        
        let db_list = db_mongo.collection("temp_humid").find().toArray().then(results =>{
            console.log(results)
        }).catch(error =>{
            console.error(error)
        })
    
    } else {
        fs.readFile(filepath, function(error, content) {
        if(error){
            response.writeHead(500);
        }else{
        response.writeHead(200, {           //respone OK
            'Content-Type': contentType
        });
        }
        response.end(content);
    });
    }
}

// create http server -----------------------------------------------------------
var server = http.createServer(requestHandler);
var ws = new WebSocket.Server({server});
server.listen(PORT);
console.log(`Server is listening at port ${PORT}`);
var json = {
    Name : "Quoc Chuong",
    Time : new Date()
};
// function broadcast để truyền tin -----------------------------------------------
function broadcast(socket, data) {

    for (var i = 0; i < clients.length; i++) {
        if (clients[i] != socket) {
            clients[i].send(data);
        }
    }
}
// xử lí khi đã thiết lập kết nối ------------------------------------------------
ws.on('connection', function(socket, req){
    const ip = req.socket.remoteAddress;
    socket.send(JSON.stringify(json));
    clients.push(socket);


    console.log(req.headers);
    console.log("Connected");
    console.log("Clients on connection: "+ clients.length);
    

    socket.on('message', function(message) {
        console.log('received: %s',message);
        console.log(ip);
        broadcast(socket, message);
    });
    socket.on('close', function() {
        var index = clients.indexOf(socket);
        clients.splice(index, 1);
        console.log('disconnected');
    });
});
