const logger = require('../utils/logger');
const { getMeals, MealServiceError } = require('../services/neisMeals');

exports.getByDate = async (req, res) => {
  try {
    return res.json({ result: 'SUCCESS', data: await getMeals(req.validated.query.date) });
  } catch (error) {
    if (error instanceof MealServiceError) {
      logger.warn(`Meal API error: ${error.code}`);
      return res.status(error.status).json({ result: 'ERROR', code: error.code, error: error.message });
    }
    logger.error('Unexpected meal API error.\n' + error);
    return res.status(500).json({ result: 'ERROR', code: 'MEAL_ERROR', error: 'Could not load meals.' });
  }
};
