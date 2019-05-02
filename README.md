# Lab 3 EAI Web Automation, made by Kenny Reida Dharmawan using Node & Puppeteer

### Objective
Find the detailed summary of a TV Series from IMDB, input the series's IMDB ID and this program will tell you the title of the series, the overall rating, the best episode and its rating, and the worst episode and its rating.

### To install:
1. Install NodeJS if you haven't already
2. Clone this repository
3. `npm install`

### To use:
`npm start`

It should start the server on [localhost:5000](http://localhost:5000), access it via postman by sending GET request to [/api/fetchTop250](http://localhost:5000/api/fetchTop250) to get top 250 tv series, and [/api/fetchSeriesRating?seriesId={YOUR SERIES ID, e.g. tt0944947 for Game of Thrones}](http://localhost:5000/api/fetchSeriesRating?seriesId=tt0944947).

By Kenny Reida Dharmawan,
1506757472.

Made with Node, Babel 7, and Puppeteer.