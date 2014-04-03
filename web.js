var constants = require('./constants.js');
var mysql  = require('mysql');
var express = require('express');

var getGraphData = function(callback) {
  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : constants.username,
    password : constants.password,
    database : 'fpdb',
    socketPath  : '/var/run/mysqld/mysqld.sock'
  });
  
  connection.connect();
  
  connection.query("SELECT hp.handId, hp.totalProfit, hp.sawShowdown, hp.allInEV FROM HandsPlayers hp INNER JOIN Players pl ON  (pl.id = hp.playerId) INNER JOIN Hands h ON  (h.id  = hp.handId) INNER JOIN Gametypes gt ON  (gt.id = h.gametypeId) WHERE pl.id in (1) AND   pl.siteId in (21) AND   h.startTime > '1970-01-02 00:00:00' AND   h.startTime < '2100-12-12 23:59:59' AND (gt.limitType = 'nl' and gt.bigBlind in (5)) and gt.category in ('holdem') AND gt.currency in ('USD') GROUP BY h.startTime, hp.handId, hp.sawShowdown, hp.totalProfit, hp.allInEV ORDER BY h.startTime", function(err, rows, fields) {
    if (err) throw err;
  
    callback(rows, fields);
  });
  
  connection.end();
}

var app = express();

app.get('/cash_graph.json', function(req, res) {
  getGraphData(function(rows, fields) {
    res.send(rows);
  });
});

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});
