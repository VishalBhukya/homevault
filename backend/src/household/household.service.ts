import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AddMemberDto, UpdateHouseholdDto } from './household.dto';

const MEMBER_FIELDS = { id: true, name: true, email: true, role: true, createdAt: true } as const;

@Injectable()
export class HouseholdService {
  constructor(private readonly prisma: PrismaService) {}

  get(householdId: string) {
    return this.prisma.household.findUniqueOrThrow({
      where: { id: householdId },
      include: { users: { select: MEMBER_FIELDS, orderBy: { createdAt: 'asc' } } },
    });
  }

  async update(householdId: string, dto: UpdateHouseholdDto) {
    await this.prisma.household.update({ where: { id: householdId }, data: dto });
    return this.get(householdId);
  }

  async addMember(householdId: string, dto: AddMemberDto) {
    if (await this.prisma.user.findUnique({ where: { email: dto.email } })) {
      throw new ConflictException('An account with this email already exists');
    }
    return this.prisma.user.create({
      data: {
        householdId,
        name: dto.name,
        email: dto.email,
        role: dto.role ?? 'MEMBER',
        passwordHash: await bcrypt.hash(dto.password, 10),
      },
      select: MEMBER_FIELDS,
    });
  }

  async removeMember(householdId: string, memberId: string, requesterId: string) {
    if (memberId === requesterId) throw new BadRequestException("You can't remove yourself");
    const member = await this.prisma.user.findFirst({ where: { id: memberId, householdId } });
    if (!member) throw new NotFoundException('Member not found');
    if (member.role === 'OWNER') throw new BadRequestException("The household owner can't be removed");
    await this.prisma.user.delete({ where: { id: memberId } });
    return { success: true };
  }
}
