import { z } from 'zod';
import codeField from '@/constants/code_field';

const checkEmailSchema = z.object({ code: codeField });

export default checkEmailSchema;
