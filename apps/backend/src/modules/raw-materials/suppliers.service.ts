import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { prisma } from '@ims/database';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@Injectable()
export class SuppliersService {
  async findAll(search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { gstin: { contains: search, mode: 'insensitive' } },
      ];
    }
    return await prisma.supplier.findMany({
      where,
      include: {
        _count: {
          select: { rawMaterials: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        rawMaterials: true,
      },
    });
    if (!supplier) throw new NotFoundException(`Supplier with ID ${id} not found.`);
    return supplier;
  }

  async create(dto: CreateSupplierDto) {
    const exists = await prisma.supplier.findUnique({ where: { code: dto.code } });
    if (exists) throw new ConflictException(`Supplier code ${dto.code} already exists.`);

    return await prisma.supplier.create({
      data: dto,
    });
  }

  async update(id: string, dto: Partial<CreateSupplierDto>) {
    const supplier = await this.findOne(id);
    if (dto.code && dto.code !== supplier.code) {
      const exists = await prisma.supplier.findUnique({ where: { code: dto.code } });
      if (exists) throw new ConflictException(`Supplier code ${dto.code} already exists.`);
    }
    return await prisma.supplier.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await prisma.rawMaterial.updateMany({
      where: { supplierId: id },
      data: { supplierId: null },
    });
    return await prisma.supplier.delete({ where: { id } });
  }
}
