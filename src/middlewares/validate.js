const logger = require("../utils/logger");

function validate(schema, target='params') {
    return (req, res, next) => {
        if (!req.validated) {
            req.validated = {
                body: {},
                params: {},
                query: {}
            }
        }

        logger.debug(`req.${target} is: ${JSON.stringify(req[target])}`);

        if (schema == undefined) {
            return next();
        }

        const result = schema.safeParse(req[target]);

        if (!result.success) {
            logger.warn('Validation failed.');
            return res.status(400).json({
                error: result.error.errors
            });
        }

        logger.debug('Validation successed.');
        req.validated[target] = result.data;

        next();
    }
}

module.exports = validate;