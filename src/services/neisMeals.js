const NEIS_ENDPOINT = 'https://open.neis.go.kr/hub/mealServiceDietInfo';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map();

class MealServiceError extends Error {
  constructor(code, message, status = 502) {
    super(message);
    this.name = 'MealServiceError';
    this.code = code;
    this.status = status;
  }
}

function requiredConfig() {
  const apiKey = process.env.NEIS_API_KEY?.trim();
  const officeCode = process.env.NEIS_EDUCATION_OFFICE_CODE?.trim();
  const schoolCode = process.env.NEIS_SCHOOL_CODE?.trim();
  if (!apiKey || !officeCode || !schoolCode) {
    throw new MealServiceError('NEIS_CONFIG_MISSING', 'NEIS API settings are incomplete.', 503);
  }
  return { apiKey, officeCode, schoolCode };
}

function cleanText(value = '') {
  return String(value).replace(/<br\s*\/?\s*>/gi, '\n').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>').replace(/&#39;/gi, "'").replace(/&quot;/gi, '"').trim();
}

function parseDish(line) {
  const allergens = [];
  const name = line.replace(/\(([\d.]+)\)\s*$/g, (_, numbers) => {
    for (const number of numbers.split('.').filter(Boolean)) {
      if (!allergens.includes(number)) allergens.push(number);
    }
    return '';
  }).trim();
  return { name, allergens };
}

function mapMeal(row) {
  return {
    type: row.MMEAL_SC_NM || '',
    date: row.MLSV_YMD || '',
    dishes: cleanText(row.DDISH_NM).split('\n').map((line) => line.trim()).filter(Boolean).map(parseDish),
    calories: cleanText(row.CAL_INFO),
    nutrition: cleanText(row.NTR_INFO),
    origin: cleanText(row.ORPLC_INFO),
  };
}

function getRows(payload) {
  if (Array.isArray(payload?.mealServiceDietInfo)) {
    const rowBlock = payload.mealServiceDietInfo.find((block) => Array.isArray(block?.row));
    if (rowBlock) return rowBlock.row;
    const result = payload.mealServiceDietInfo
      .flatMap((block) => block?.head || [])
      .find((item) => item?.RESULT)?.RESULT;
    if (result?.CODE === 'INFO-200') return [];
    if (result?.MESSAGE) throw new MealServiceError(result.CODE || 'NEIS_ERROR', result.MESSAGE);
    return [];
  }
  const result = payload?.RESULT;
  if (result?.CODE === 'INFO-200') return [];
  if (result?.MESSAGE) throw new MealServiceError(result.CODE || 'NEIS_ERROR', result.MESSAGE);
  return [];
}

async function getMeals(date) {
  const config = requiredConfig();
  const cacheKey = `${config.officeCode}:${config.schoolCode}:${date}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return { ...cached.data, cached: true };

  const params = new URLSearchParams({ KEY: config.apiKey, Type: 'json', pIndex: '1', pSize: '20',
    ATPT_OFCDC_SC_CODE: config.officeCode, SD_SCHUL_CODE: config.schoolCode, MLSV_YMD: date.replaceAll('-', '') });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  let response;
  try {
    response = await fetch(`${NEIS_ENDPOINT}?${params}`, { signal: controller.signal });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'AbortError';
    throw new MealServiceError(timedOut ? 'NEIS_TIMEOUT' : 'NEIS_NETWORK_ERROR', timedOut ? 'NEIS request timed out.' : 'Could not reach NEIS.');
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok) throw new MealServiceError('NEIS_HTTP_ERROR', `NEIS returned HTTP ${response.status}.`);
  let payload;
  try { payload = await response.json(); } catch { throw new MealServiceError('NEIS_INVALID_RESPONSE', 'NEIS returned an invalid response.'); }
  const data = { date, meals: getRows(payload).map(mapMeal), fetchedAt: new Date().toISOString(), cached: false };
  cache.set(cacheKey, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}

module.exports = { getMeals, getRows, mapMeal, MealServiceError };
