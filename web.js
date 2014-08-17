var constants = require('./constants.js');
var mysql  = require('mysql');
var express = require('express');
var cors = require('cors');

var runQuery = function(query, callback) {
  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : constants.username,
    password : constants.password,
    database : 'fpdb',
    socketPath  : '/var/run/mysqld/mysqld.sock'
  });
  
  connection.connect();
  
  connection.query(query, function(err, rows, fields) {
    if (err) throw err;
    callback(rows, fields);
  });
  
  connection.end();
};

var getCashGraphData = function(callback) {
  runQuery("SELECT pl.siteId, hp.handId, hp.totalProfit, hp.sawShowdown, hp.allInEV FROM HandsPlayers hp INNER JOIN Players pl ON (pl.id = hp.playerId) INNER JOIN Hands h ON (h.id  = hp.handId) INNER JOIN Gametypes gt ON (gt.id = h.gametypeId) WHERE pl.id in (2, 16) AND   pl.siteId in (21, 23) AND   h.startTime > '1970-01-02 00:00:00' AND   h.startTime < '2100-12-12 23:59:59' AND (gt.limitType = 'nl' and gt.bigBlind in (5, 10)) and gt.category in ('holdem') AND gt.currency in ('USD') GROUP BY h.startTime, hp.handId, hp.sawShowdown, hp.totalProfit, hp.allInEV ORDER BY h.startTime", callback);
};

var getTourneyGraphData = function(callback) {
  runQuery("SELECT pl.siteId, tp.tourneyId, (coalesce(tp.winnings,0) - coalesce(tt.buyIn,0) - coalesce(tt.fee,0)) as profit, tp.koCount, tp.rebuyCount, tp.addOnCount, tt.buyIn, tt.fee, t.siteTourneyNo FROM TourneysPlayers tp INNER JOIN Players pl ON (pl.id = tp.playerId) INNER JOIN Tourneys t ON (t.id  = tp.tourneyId) INNER JOIN TourneyTypes tt ON (tt.id = t.tourneyTypeId) WHERE pl.id in (2) AND   pl.siteId in (21) AND   (t.startTime > '1970-01-02 00:00:00' AND t.startTime < '2100-12-12 23:59:59') AND   tt.currency = 'USD' GROUP BY t.startTime, tp.tourneyId, tp.winningsCurrency, tp.winnings, tp.koCount, tp.rebuyCount, tp.addOnCount, tt.buyIn, tt.fee, t.siteTourneyNo ORDER BY t.startTime", callback);
};

var app = express();

app.use(cors());

app.get('/fpdb-display/cash_graph.json', function(req, res) {
  getCashGraphData(function(rows, fields) {
    res.send(rows);
  });
});

app.get('/fpdb-display/tourney_graph.json', function(req, res) {
  getTourneyGraphData(function(rows, fields) {
    res.send(rows);
  });
});

var server = app.listen(3030, function() {
  console.log('Listening on port %d', server.address().port);
});
