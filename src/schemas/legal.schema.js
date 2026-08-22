const z = require('zod');
const consentSchema = z.object({
  serviceTerms: z.literal(true),
  privacyPolicy: z.literal(true),
  anonymousBoardNotice: z.literal(true),
  ageOrGuardianConfirmed: z.literal(true),
});
module.exports = { consentSchema };
