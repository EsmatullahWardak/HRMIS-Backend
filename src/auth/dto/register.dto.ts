export class RegisterDto {
  name?: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'OFFICER' | 'EMPLOYEE';
}

