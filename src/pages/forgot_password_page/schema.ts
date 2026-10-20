import { z } from 'zod';
import emailField from '@/utils/email_field';

const forgotPasswordSchema = z.object({ email: emailField });

export default forgotPasswordSchema;
