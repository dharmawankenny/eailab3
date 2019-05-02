# Lab 3 EAI Web Automation, made by Kenny Reida Dharmawan using Node & Puppeteer

### Objective
Get Summary Data of Top 250 TV Series List from IMDB, including the title, rank, IMDB ID, and headliner performer of each series. Find the detailed summary of a TV Series from IMDB, input the series's IMDB ID and this program will tell you the title of the series, # of episodes in the series, the overall rating, the best episode and its rating, and the worst episode and its rating.

### To install:
1. Install NodeJS if you haven't already
2. Clone this repository
3. `npm install`

### To use:
`npm start`

It should start the server on [localhost:5000](http://localhost:5000), access it via postman by sending GET request to [/api/fetchTop250](http://localhost:5000/api/fetchTop250) to get top 250 tv series, and [/api/fetchSeriesRating?seriesId={YOUR SERIES ID, e.g. tt0944947 for Game of Thrones}](http://localhost:5000/api/fetchSeriesRating?seriesId=tt0944947).

Also deployed on heroku, fetch top 250 movies data [here](https://eailab3.herokuapp.com/api/fetchTop250) and get series rating summary [here (e.g. Game of Thrones)](https://eailab3.herokuapp.com/api/fetchSeriesRating?seriesId=tt0944947). Caveat for Heroku deployment are that it currently cannot handle parallel requests since its a free dyno and i am still new with puppeteer :(.

By Kenny Reida Dharmawan,
1506757472.

Made with Node, Babel 7, and Puppeteer.
