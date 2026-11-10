import { z } from 'zod';

/** The backend expects the complete restaurant appearance object, including its desktop sidebar preference. */
const appearanceSchema = z.object({
  appearance: z.object({
    theme: z.enum(['indigo', 'saffron', 'emerald', 'ocean', 'bordeaux', 'onyx']),
    mode: z.enum(['light', 'dark', 'system']),
    sidebar: z.enum(['theme', 'plain']),
  }),
});

export default appearanceSchema;
