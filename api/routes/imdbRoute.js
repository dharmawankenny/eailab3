import { fetchImdbTop250Series, fetchImdbSeriesRating } from '../controllers/imdbController';

export default function imdbRoute(app) {
  app.route('/api/fetchTop250').get(fetchImdbTop250Series);
  app.route('/api/fetchSeriesRating').get(fetchImdbSeriesRating);
}
