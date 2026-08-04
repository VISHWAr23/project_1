import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { prisma, UserRole } from '@ims/database';
import { LoginInput } from '@ims/validation';

export interface RegisterInput extends LoginInput {
  role?: UserRole;
  employeeId?: string;
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email address already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        role: input.role || UserRole.ADMIN,
        employeeId: input.employeeId || null,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return {
      message: 'User provisioned successfully',
      user,
    };
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email address or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email address or password');
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            department: true,
            designation: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User profile not found');
    }

    return user;
  }
}
