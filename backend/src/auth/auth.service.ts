import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { addDays } from '../common/dates';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('An account with this email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const household = await this.prisma.household.create({
      data: {
        name: dto.householdName?.trim() || `${dto.name.split(' ')[0]}'s Household`,
        plan: 'FAMILY',
        trialEndsAt: addDays(new Date(), 30),
        users: { create: { name: dto.name, email: dto.email, passwordHash, role: 'OWNER' } },
      },
      include: { users: true },
    });
    return this.issueToken(household.users[0]);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.issueToken(user);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { household: true },
    });
    const { passwordHash, ...safe } = user;
    return safe;
  }

  private issueToken(user: { id: string; householdId: string; role: string; email: string; name: string }) {
    const accessToken = this.jwt.sign({ sub: user.id, householdId: user.householdId, role: user.role });
    return {
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, householdId: user.householdId },
    };
  }
}
