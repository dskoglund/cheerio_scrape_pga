var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

app.get('/pga_schedule', function(req, res){

  url = 'http://m.espn.com/golf/eventschedule?seriesId=1&wjb=';

  request(url, function(error, response, html){
    if(!error){

      const $ = cheerio.load(html);

      const dates = [];
      let date;

      $("table tr").filter(function(){
          const data = $(this);
          date = data.children().first().text();
          if (date != "Date" && date.length != 0 ) {
            dates.push(date);
          }
      })

      const tourEvents = [];
      let tourEvent;

      $("table tr").filter(function(){
          const data = $(this)
          tourEvent = data.children().eq(1).text();
          if (tourEvent != "Event" && tourEvent.length != 0 ) {
            tourEvents.push(tourEvent);
            console.log(tourEvents);
          }
      })
    }

  // To write to the system we will use the built in 'fs' library.
  // In this example we will pass 3 parameters to the writeFile function
  // Parameter 1 :  output.json - this is what the created filename will be called
  // Parameter 2 :  JSON.stringify(json, null, 4) - the data to write, here we do an extra step by calling JSON.stringify to make our JSON easier to read
  // Parameter 3 :  callback function - a callback function to let us know the status of our function

  // Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
  res.send('data')

  });
})


app.listen('8081')

console.log('Magic happens on port 8081');

exports = module.exports = app;
