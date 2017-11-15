const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const app = express();

let leaderboardUrl;

app.get('/pga_schedule', function(req, res){

  pgaScheduleUrl = 'http://www.espn.com/golf/schedule';

  request(pgaScheduleUrl, function(error, response, html){
    if(!error){

      const $ = cheerio.load(html);
      let json = {};
      const pgaEventSchedule = [];

      $('.col-main').find("table").last().find("tr.oddrow, tr.evenrow").filter(function(){
        const pgaUpcomingEvent = { date: '', name: '', location: '', completed: false }
        const data = $(this);
        const hasNumber = /\d/;
        if (hasNumber.test(data.children('td').children('nobr').text())) {
          pgaUpcomingEvent.date = data.children('td').children('nobr').text();
          if (data.children('td').eq(1).clone().children().remove().end().text()==="") {
            pgaUpcomingEvent.name =  data.children('td').eq(1).children('b').clone().children().remove().end().text()
          }else {
            pgaUpcomingEvent.name = data.children('td').eq(1).clone().children().remove().end().text()
          }
          if (data.children('td').eq(1).children('em').text()==="") {
            pgaUpcomingEvent.location = data.children('td').eq(1).children('b').children('em').text()
          }else {
            pgaUpcomingEvent.location = data.children('td').eq(1).children('em').text()
          }
          if (hasNumber.test(pgaUpcomingEvent.date)) {
            pgaEventSchedule.push(pgaUpcomingEvent)
          }
          if (pgaEventSchedule.length>1) {
            json = pgaEventSchedule
          }
        }
      })
      fs.writeFile('schedule.json', JSON.stringify(json, null, 4), function(err){
        console.log('File successfully written! - Check your project directory for the output.json file');
      });
      res.send('check console')
    }
  })
});

app.get('/tournament_this_week', function(req, res){

  eventThisWeekUrl = 'http://www.espn.com/golf/schedule';

  request(eventThisWeekUrl, function(error, response, html){
    if(!error){

      const $ = cheerio.load(html);
      let json = {};

      $('.col-main').filter(function(){
        const pgaEventThisWeek = { id: '', date: '', name: '', location: '', completed: false, detailsUrl: ''}
        const data = $(this);
        const hasNumber = /\d/;
        const thisWeek = data.find("table").first().find(".stathead").children().text()
        const tournamentDate = data.find("table").first().find(".oddrow").children().first().text()
        const tournamentEvent = data.find("table").first().find(".oddrow").children().eq(1).children('a').text()
        const tournamentLocation = data.find("table").first().find(".oddrow").children().eq(1).children('em').text()
        const detailsUrl = data.find("table").first().find(".oddrow").children().eq(1).children('a').attr('href')
        const tournamentId = data.find("table").first().find(".oddrow").children().eq(1).children('a').attr('href').substr(-4)

        if (thisWeek === 'This Week') {
          pgaEventThisWeek.date = tournamentDate
          pgaEventThisWeek.name = tournamentEvent
          pgaEventThisWeek.location = tournamentLocation
          pgaEventThisWeek.detailsUrl = "http://www.espn.com/" + detailsUrl
          pgaEventThisWeek.id= Number(tournamentId)
          console.log(pgaEventThisWeek)
        if (pgaEventThisWeek.length=1) {
          json = pgaEventThisWeek
          getCurrentField(pgaEventThisWeek.id)
        }
        } else {
          console.log('nothing this week')
        }

      })
      fs.writeFile('event.json', JSON.stringify(json, null, 4), function(err){
        console.log('File successfully written! - Check your project directory for the output.json file');
      })
    }
  res.send('This weeks event data in console')
  });
});

function getCurrentField(URL) {
  app.get('/tournament_details', function(req, res){

    const fieldURL = "http://www.espn.com/golf/leaderboard?tournamentId=" + URL

    request(fieldURL, function(error, response, html){
      if(!error){

        const $ = cheerio.load(html);
        let json = {};
        const pgaEventField = [];

        $('#leaderboard-view').find("table tbody").filter(function(){
          const pgaUpcomingEventField = { name:'', teetime:'', playerId:''}
          const data = $(this);
          const hasNumber = /\d/;

          console.log(data.find('.full-name').text())
        })
        fs.writeFile('field.json', JSON.stringify(json, null, 4), function(err){
          console.log('File successfully written! - Check your project directory for the field.json file');
        });
        res.send('check console')
      }
    })
  });
}
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
    else {
      console.log('No tournament')
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
