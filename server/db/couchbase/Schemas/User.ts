import { UUID } from 'crypto';

export type User = {
  id: UUID;
  firstname: string;
  lastname: string;
  email: string;
  passwordhash: string;
};
