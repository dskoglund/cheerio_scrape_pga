const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const app = express();

let leaderboardUrl;
let pgaFieldSalary = [];
let pgaEventField = [];
let pgaEventThisWeek = [];
let pgaEventSchedule = [];

app.get('/', function(req, res){

  pgaScheduleUrl = 'http://www.espn.com/golf/schedule';

  request(pgaScheduleUrl, function(error, response, html){
    if(!error){

      const $ = cheerio.load(html);
      let json = {}

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
        console.log('File successfully written! - Check your project directory for the schedule.json file');
      });
      res.send(json)
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
        const data = $(this);
        const eventThisWeek = { id: '', date: '', name: '', location: '', completed: false, detailsUrl: ''}
        const hasNumber = /\d/;
        const thisWeek = data.find("table").first().find(".stathead").children().text()
        const tournamentDate = data.find("table").first().find(".oddrow").children().first().text()
        const tournamentEvent = data.find("table").first().find(".oddrow").children().eq(1).children('a').text()
        const tournamentLocation = data.find("table").first().find(".oddrow").children().eq(1).children('em').text()
        const detailsUrl = data.find("table").first().find(".oddrow").children().eq(1).children('a').attr('href')
        const tournamentId = data.find("table").first().find(".oddrow").children().eq(1).children('a').attr('href').substr(-4)

        if (thisWeek === 'This Week') {
          eventThisWeek.date = tournamentDate
          eventThisWeek.name = tournamentEvent
          eventThisWeek.location = tournamentLocation
          eventThisWeek.detailsUrl = "http://www.espn.com/" + detailsUrl
          eventThisWeek.id= Number(tournamentId)
          console.log(eventThisWeek)
        if (eventThisWeek.name != "") {
          pgaEventThisWeek.push(eventThisWeek)
          getCurrentField(eventThisWeek.id)
        }
        } else {
          console.log('nothing this week')
        }
        if (pgaEventThisWeek.length>0) {
          json = pgaEventThisWeek
        }
      })
      fs.writeFile('event.json', JSON.stringify(json, null, 4), function(err){
        console.log('File successfully written! - Check your project directory for the event.json file');
      })
      res.send(json)
    }
  });
});
app.get('/player_salary', function(req, res){

  const salaryURL= "https://www.rotowire.com/daily/golf/optimizer.php?site=DraftKings&sport=PGA"

  request(salaryURL, function(error, response, html){
    if(!error){

      const $ = cheerio.load(html);
      let json = {}

      $('#players tr').filter(function(){
        const data = $(this);
        const pgaUpcomingEventSalary = { name: '', salary: ''}
        pgaUpcomingEventSalary.name = data.children('.rwo-name').children('a').text()
        let salaryConversion = data.children('.rwo-salary').children('.salaryInput').prop('value')
        pgaUpcomingEventSalary.salary = salaryConversion.replace(/[^\d.]/g, '')/1000
        if (pgaUpcomingEventSalary.length!="") {
          console.log('salary pushed')
          pgaFieldSalary.push(pgaUpcomingEventSalary)
        }
        if (pgaFieldSalary.length>1) {
          console.log('json created')
          json = pgaFieldSalary
        }
      })
      fs.writeFile('salary.json', JSON.stringify(json, null, 4), function(err){
        console.log('File successfully written! - Check your project directory for the salary.json file');
      });
      if(json != {}){
        res.send(json)
      }else {
        res.send("you made a mistake")
      }
    }
  });
})
function getCurrentField(URL) {
  app.get('/tournament_details', function(req, res){

    const fieldURL = "http://www.espn.com/golf/leaderboard?tournamentId=" + URL

    request(fieldURL, function(error, response, html){
      if(!error){

        const $ = cheerio.load(html);
        let json = {};


        $('#leaderboard-view').find("table tbody").filter(function(){
          const pgaUpcomingEventField = { name:'', teetime:'', playerId:'', salary:''}
          const data = $(this);
          const hasNumber = /\d/;
          const str = data.find(".date-container").attr('data-date')

          pgaUpcomingEventField.name = data.find('.full-name').text()
          pgaUpcomingEventField.teetime = data.find('time1').text()
          var date = new Date(Date.parse(str)-43200000)
          // console.log(data.load().find('time1'))
          // console.log(data.find('time1'))
          // console.log(pgaUpcomingEventField)
          if (pgaUpcomingEventField.name != "") {
            pgaEventField.push(pgaUpcomingEventField)
          }
          if (pgaEventField.length>1) {
            json = pgaEventField
          }
        })
        fs.writeFile('field.json', JSON.stringify(json, null, 4), function(err){
          console.log('File successfully written! - Check your project directory for the field.json file');
        });
        res.send(json)
      }
    })
  });
}
// app.get('/pga_leaderboard', function(req, res){
//
//   request(leaderboardUrl, function(error, response, html){
//     if(!error){
//
//       const $ = cheerio.load(html);
//
//       const leaderBoard = []
//
//       $("table tr").filter(function(){
//         const data = $(this);
//         const player = { position: '', playerName: '', overallScore: '', roundScore: '', playerUrl: ''}
//         const hasNumber = /\d/;
//         if (hasNumber.test(data.children().first().text())) {
//           player.position = data.children().first().text()
//           player.playerName = data.children("td:nth-child(2)").text()
//           player.overallScore = data.children("td:nth-child(3)").text()
//           player.roundScore = data.children("td:nth-child(4)").text()
//           player.playerUrl = "http://m.espn.com/golf/"+data.children("td:nth-child(2)").children().attr('href')
//         }
//         if (hasNumber.test(player.position)) {
//           leaderBoard.push(player)
//         }
//         console.log(leaderBoard)
//       })
//     }
//     else {
//       console.log('No tournament')
//     }
//
//   res.send('leaderboard data in console')
//   });
// });

app.get('/pga_player_score', function(req, res){

  let playerID = 5539
  //req.body.playerID
  let round = 1
  //req.body.round
  let tournamentID = 3791
  //req.body.tournamentID
  //temporary URL. Will be in the request headers for app. (angular factory : let params = {playerID: NUM,round: NUM, tournamentID: NUM })
  const playerUrl = "http://m.espn.com/golf/playercast?playerId="+playerID+"&tournamentId="+tournamentID+"&wjb=&round="+round

  request(playerUrl, function(error, response, html){
    if(!error){

      const $ = cheerio.load(html);

      const roundScore = []

      $("table tr").filter(function(){
        const data = $(this);
        const hole = { hole: '', holePar: '', holeScore: '', roundScore: '', bestBall: ''}
        const hasNumber = /\d/;
        if (hasNumber.test(data.children().first().text())) {
          hole.hole = Number(data.children().first().text())
          hole.holePar = Number(data.children("td:nth-child(2)").text())
          hole.holeScore = Number(data.children("td:nth-child(3)").text())
          if (data.children("td:nth-child(4)").text()==="E") {
            hole.roundScore = 0
          }else {
            hole.roundScore = Number(data.children("td:nth-child(4)").text())
          }
          hole.bestBall = Number(data.children("td:nth-child(2)").text()-data.children("td:nth-child(3)").text())
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
