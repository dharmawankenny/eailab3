import puppeteer from 'puppeteer';

export async function fetchImdbTop250Series(req, res) {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    await page.goto('https://www.imdb.com/chart/toptv/');

    const top250Elements = await page.$$('tbody.lister-list tr');

    Promise.all(
      top250Elements.map(async (top250Element, index) => {
        const titleElement = await top250Element.$('td.titleColumn a');
        const title = await (await titleElement.getProperty('textContent')).jsonValue();
        const link = await (await titleElement.getProperty('href')).jsonValue();
        const headline = await (await titleElement.getProperty('title')).jsonValue();
        const id = link.replace('https://', '').split('/')[2];

        return { rank: index + 1, id, title, headline };
      })
    ).then(
      top250 => res.send(top250)
    );
  } catch (e) {
    res.status(500).send(e);
  }
}

export async function fetchImdbSeriesRating(req, res) {
  const seriesId = req.query.seriesId;

  try {
    // initiate puppeteer (headless chrome)
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    // open a new tab
    const page = await browser.newPage();

    // go to IMDB page based on user input
    const puppeteerRes = await page.goto(`https://www.imdb.com/title/${seriesId}`);

    // check response status of IMDB page, if it is 400++ it is either input error or IMDB server error
    if (puppeteerRes.status() >= 400) {
      if (puppeteerRes.status() === 404) {
        // special message for 404, which means that the given ID is invalid and no series or movie is found on IMDB
        res.status(404).send('Err! The IMDB ID that you provide is not found, make sure you provide a correct one.');
      } else {
        // Generic info for other errors
        res.status(puppeteerRes.status()).send('Err! IMDB Server is unreachable.');
      }
    }
    
    // check if the resulting page is a page about a TV series, non tv-series page (e.g. movies)
    // will not have this element
    const hasEpisodes = await page.$('div#title-episode-widget');

    // tell the user that the ID is valid but it is not a TV Series, and exit the program
    if (hasEpisodes === null) {
      res.status(404).send('Err! The IMDB ID that you provide points to a movie, not a series, please provide a correct series ID.');
    }
    
    // if its a valid series, scrap its Title and Overall rating info.
    const seriesTitleElement = await page.$('div#title-overview-widget div.title_wrapper h1');
    const seriesTitle = await (await seriesTitleElement.getProperty('textContent')).jsonValue();
  
    const seriesEpisodeCountElement = await page.$('div#title-overview-widget span.bp_sub_heading');
    const seriesEpisodeCount = await (await seriesEpisodeCountElement.getProperty('textContent')).jsonValue();

    const seriesRatingElement = await page.$('div#title-overview-widget div.ratingValue strong');
    const seriesRating = await (await seriesRatingElement.getProperty('title')).jsonValue();

    // go to the series episode lists query for 1 best episode by user rating
    await page.goto(`https://www.imdb.com/search/title/?series=${seriesId}&view=simple&count=1&sort=user_rating,desc`);

    // get all the links element from the query result, first link refers to the series page,
    // second link refers to the episode page
    const seriesBestEpisodeLinkElements = await page.$$('span.lister-item-header span a');
    // grab the second link element
    const seriesBestEpisodeLinkElement = seriesBestEpisodeLinkElements[1];
    // grab its target url
    const seriesBestEpisodeLink = await (await seriesBestEpisodeLinkElement.getProperty('href')).jsonValue();

    // go to the best rated episode page
    await page.goto(seriesBestEpisodeLink);

    // get the title, trim its useless whitespace
    const seriesBestEpisodeTitleElement = await page.$('div#title-overview-widget div.title_wrapper h1');
    let seriesBestEpisodeTitle = await (await seriesBestEpisodeTitleElement.getProperty('textContent')).jsonValue();
    seriesBestEpisodeTitle = seriesBestEpisodeTitle.trim();

    // get the episode number (season x, episode y), format it from Season X | Episode Y to Season X, Episode Y
    const seriesBestEpisodeEpisodeElement = await page.$('div#title-overview-widget div.bp_heading');
    let seriesBestEpisodeEpisode = await (await seriesBestEpisodeEpisodeElement.getProperty('textContent')).jsonValue();
    seriesBestEpisodeEpisode = seriesBestEpisodeEpisode.replace(' |', ',');

    // get the episode rating
    const seriesBestEpisodeRatingElement = await page.$('div#title-overview-widget div.ratingValue strong');
    const seriesBestEpisodeRating = await (await seriesBestEpisodeRatingElement.getProperty('title')).jsonValue();

    // go to the series episode lists query for 1 worst episode by user rating
    await page.goto(`https://www.imdb.com/search/title/?series=${seriesId}&view=simple&count=1&sort=user_rating,asc`);

    // same as before, get link to the worst episode from query result
    const seriesWorstEpisodeLinkElements = await page.$$('span.lister-item-header span a');
    const seriesWorstEpisodeLinkElement = seriesWorstEpisodeLinkElements[1];
    const seriesWorstEpisodeLink = await (await seriesWorstEpisodeLinkElement.getProperty('href')).jsonValue();

    // go to the worst episode page
    await page.goto(seriesWorstEpisodeLink);

    // get the title, trim its useless whitespace
    const seriesWorstEpisodeTitleElement = await page.$('div#title-overview-widget div.title_wrapper h1');
    let seriesWorstEpisodeTitle = await (await seriesWorstEpisodeTitleElement.getProperty('textContent')).jsonValue();
    seriesWorstEpisodeTitle = seriesWorstEpisodeTitle.trim();

    // get the episode number (season x, episode y), format it from Season X | Episode Y to Season X, Episode Y
    const seriesWorstEpisodeEpisodeElement = await page.$('div#title-overview-widget div.bp_heading');
    let seriesWorstEpisodeEpisode = await (await seriesWorstEpisodeEpisodeElement.getProperty('textContent')).jsonValue();
    seriesWorstEpisodeEpisode = seriesWorstEpisodeEpisode.replace(' |', ',');

    // get the episode rating
    const seriesWorstEpisodeRatingElement = await page.$('div#title-overview-widget div.ratingValue strong');
    const seriesWorstEpisodeRating = await (await seriesWorstEpisodeRatingElement.getProperty('title')).jsonValue();
    
    res.send({
      seriesTitle,
      episodeCount: seriesEpisodeCount,
      overalRating: seriesRating,
      bestEpisodeTitle: `${seriesBestEpisodeTitle} (${seriesBestEpisodeEpisode})`,
      bestEpisodeRating: seriesBestEpisodeRating,
      worstEpisodeTitle: `${seriesWorstEpisodeTitle} (${seriesWorstEpisodeEpisode})`,
      worstEpisodeRating: seriesWorstEpisodeRating,
    });
  } catch (e) {
    // log the generic error, i.e. no connection, connection to slow/timeouts, etc.
    res.status(500).send(e);
  }
}
