import puppeteer from 'puppeteer';
import readlineSync from 'readline-sync';

async function fetchImdbSeriesRating() {
  const seriesId = readlineSync.question('What is the IMDB ID of the series you are looking for?\n');
  
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    console.log('Waiting ..... Reaching the IMDB Servers .....');

    const res = await page.goto(`https://www.imdb.com/title/${seriesId}`);

    if (res.status() >= 400) {
      if (res.status() === 404) {
        console.log('The IMDB ID that you provide is not found, make sure you provide a correct one.');
      } else {
        console.log('IMDB Server is unreachable.');
      }
      process.exit();
    }
    
    const hasEpisodes = await page.$('div#title-episode-widget');

    if (hasEpisodes === null) {
      console.log('The IMDB ID that you provide points to a movie, not a series, please provide a correct series ID.');
      process.exit();
    }
    

    const seriesTitleElement = await page.$('div#title-overview-widget div.title_wrapper h1');
    const seriesTitle = await (await seriesTitleElement.getProperty('textContent')).jsonValue();

    const seriesRatingElement = await page.$('div#title-overview-widget div.ratingValue strong');
    const seriesRating = await (await seriesRatingElement.getProperty('title')).jsonValue();

    await page.goto(`https://www.imdb.com/search/title/?series=${seriesId}&view=simple&count=1&sort=user_rating,desc`);

    const seriesBestEpisodeLinkElements = await page.$$('span.lister-item-header span a');
    const seriesBestEpisodeLinkElement = seriesBestEpisodeLinkElements[1];
    const seriesBestEpisodeLink = await (await seriesBestEpisodeLinkElement.getProperty('href')).jsonValue();

    await page.goto(seriesBestEpisodeLink);

    const seriesBestEpisodeTitleElement = await page.$('div#title-overview-widget div.title_wrapper h1');
    let seriesBestEpisodeTitle = await (await seriesBestEpisodeTitleElement.getProperty('textContent')).jsonValue();
    seriesBestEpisodeTitle = seriesBestEpisodeTitle.trim();

    const seriesBestEpisodeEpisodeElement = await page.$('div#title-overview-widget div.bp_heading');
    let seriesBestEpisodeEpisode = await (await seriesBestEpisodeEpisodeElement.getProperty('textContent')).jsonValue();
    seriesBestEpisodeEpisode = seriesBestEpisodeEpisode.replace(' |', ',');

    const seriesBestEpisodeRatingElement = await page.$('div#title-overview-widget div.ratingValue strong');
    const seriesBestEpisodeRating = await (await seriesBestEpisodeRatingElement.getProperty('title')).jsonValue();

    await page.goto(`https://www.imdb.com/search/title/?series=${seriesId}&view=simple&count=1&sort=user_rating,asc`);

    const seriesWorstEpisodeLinkElements = await page.$$('span.lister-item-header span a');
    const seriesWorstEpisodeLinkElement = seriesWorstEpisodeLinkElements[1];
    const seriesWorstEpisodeLink = await (await seriesWorstEpisodeLinkElement.getProperty('href')).jsonValue();

    await page.goto(seriesWorstEpisodeLink);

    const seriesWorstEpisodeTitleElement = await page.$('div#title-overview-widget div.title_wrapper h1');
    let seriesWorstEpisodeTitle = await (await seriesWorstEpisodeTitleElement.getProperty('textContent')).jsonValue();
    seriesWorstEpisodeTitle = seriesWorstEpisodeTitle.trim();

    const seriesWorstEpisodeEpisodeElement = await page.$('div#title-overview-widget div.bp_heading');
    let seriesWorstEpisodeEpisode = await (await seriesWorstEpisodeEpisodeElement.getProperty('textContent')).jsonValue();
    seriesWorstEpisodeEpisode = seriesWorstEpisodeEpisode.replace(' |', ',');

    const seriesWorstEpisodeRatingElement = await page.$('div#title-overview-widget div.ratingValue strong');
    const seriesWorstEpisodeRating = await (await seriesWorstEpisodeRatingElement.getProperty('title')).jsonValue();

    console.log('\nSeries Name:');
    console.log(seriesTitle);
    console.log(`Overall Rating: ${seriesRating}`);
    console.log('\nBest Episode:');
    console.log(`${seriesBestEpisodeTitle} (${seriesBestEpisodeEpisode})`);
    console.log(`Rating: ${seriesBestEpisodeRating}`);
    console.log('\nWorst Episode:');
    console.log(`${seriesWorstEpisodeTitle} (${seriesWorstEpisodeEpisode})`);
    console.log(`Rating: ${seriesWorstEpisodeRating}`);
  
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit();
  }
}

fetchImdbSeriesRating();
