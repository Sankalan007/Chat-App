import { v4 as uuidv4 } from 'uuid';

export function generateUserId(): string {
  const uuid = uuidv4();
  return uuid.replace(/-/g, '').substring(0, 8);
}
