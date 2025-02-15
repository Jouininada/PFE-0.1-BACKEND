import * as bcrypt from 'bcrypt';

export async function encryptPasswordWithSalt10(
  password: string,
): Promise<string> {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}
