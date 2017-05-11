const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const app = express();

let leaderboardUrl;

app.get('/pga_schedule', function(req, res){

  scheduleUrl = 'http://m.espn.com/golf/eventschedule?seriesId=1&wjb=';

  request(scheduleUrl, function(error, response, html){
    if(!error){

      const $ = cheerio.load(html);

      const pgaEventSchedule = [];

      $("table tr").filter(function(){
        const pgaEvent = { date: '', tournamentEvent: '', completed: false, detailsUrl: '', resultsUrl: '', leaderboardUrl: ''}
        const data = $(this);
        const hasNumber = /\d/;
            if (hasNumber.test(data.children("td:first-child").text())) {
              pgaEvent.date = data.children("td:first-child").text()
              pgaEvent.tournamentEvent = data.children("td:nth-child(2)").text()
              pgaEvent.detailsUrl = "http://m.espn.com/golf/"+data.children("td:nth-child(2)").children().attr('href')
            }
            if (data.children("td:nth-child(3)").children().attr('href') != undefined) {
              pgaEvent.resultsUrl = "http://m.espn.com/golf/"+data.children("td:nth-child(3)").children().attr('href')
              pgaEvent.completed = true
            }
            if (data.children("td:nth-child(3)").children().text() === "Leaderboard") {
              pgaEvent.leaderboardUrl = "http://m.espn.com/golf/"+data.children("td:nth-child(3)").children().attr('href')
              pgaEvent.resultsUrl = ''
              leaderboardUrl = "http://m.espn.com/golf/"+data.children("td:nth-child(3)").children().attr('href')
            }
            if (hasNumber.test(pgaEvent.date)) {
              pgaEventSchedule.push(pgaEvent)
            }
            console.log(pgaEventSchedule)
            console.log(leaderboardUrl)
      })
    }
  res.send('schedule data in console')
  });
});

app.get('/pga_leaderboard', function(req, res){

  request(leaderboardUrl, function(error, response, html){
    if(!error){

      const $ = cheerio.load(html);

      const leaderBoard = []

      $("table tr").filter(function(){
        const data = $(this);
        const player = { position: '', playerName: '', overallScore: '', roundScore: '', playerUrl: ''}
        const hasNumber = /\d/;
        if (hasNumber.test(data.children().first().text())) {
          player.position = data.children().first().text()
          player.playerName = data.children("td:nth-child(2)").text()
          player.overallScore = data.children("td:nth-child(3)").text()
          player.roundScore = data.children("td:nth-child(4)").text()
          player.playerUrl = "http://m.espn.com/golf/"+data.children("td:nth-child(2)").children().attr('href')
        }
        if (hasNumber.test(player.position)) {
          leaderBoard.push(player)
        }
        console.log(leaderBoard)
      })
    }
  res.send('leaderboard data in console')
  });
});

app.get('/pga_player_score', function(req, res){

  // let url = req.playerUrl
  // let round = req.round
  // const playerUrl = url + round
  //temporary URL. Will be in the request headers for app.
  const playerUrl = "http://m.espn.com/golf/playercast?playerId=6931&tournamentId=2699&wjb=&round="+1

  request(playerUrl, function(error, response, html){
    if(!error){

      const $ = cheerio.load(html);

      const roundScore = []

      $("table tr").filter(function(){
        const data = $(this);
        const hole = { hole: '', holePar: '', holeScore: '', roundScore: '', bestBall: ''}
        const hasNumber = /\d/;
        if (hasNumber.test(data.children().first().text())) {
          hole.hole = data.children().first().text()
          hole.holePar = data.children("td:nth-child(2)").text()
          hole.holeScore = data.children("td:nth-child(3)").text()
          hole.roundScore = data.children("td:nth-child(4)").text()
          hole.bestBall = data.children("td:nth-child(2)").text()-data.children("td:nth-child(3)").text()
        }
        if (hasNumber.test(hole.hole)) {
          roundScore.push(hole)
        }
        console.log(roundScore)
      })
    }
  res.send('leaderboard data in console')
  });
});


app.listen('8081')

console.log('Magic happens on port 8081');

exports = module.exports = app;
