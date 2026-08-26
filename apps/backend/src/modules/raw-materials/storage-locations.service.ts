import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { prisma } from '@ims/database';
import { CreateStorageLocationDto } from './dto/create-storage-location.dto';

@Injectable()
export class StorageLocationsService {
  async findAll(search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { warehouseZone: { contains: search, mode: 'insensitive' } },
      ];
    }
    return await prisma.storageLocation.findMany({
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
    const location = await prisma.storageLocation.findUnique({
      where: { id },
      include: {
        rawMaterials: true,
      },
    });
    if (!location) throw new NotFoundException(`Storage location with ID ${id} not found.`);
    return location;
  }

  async create(dto: CreateStorageLocationDto) {
    const exists = await prisma.storageLocation.findUnique({ where: { code: dto.code } });
    if (exists) throw new ConflictException(`Location code ${dto.code} already exists.`);

    return await prisma.storageLocation.create({
      data: dto,
    });
  }

  async update(id: string, dto: Partial<CreateStorageLocationDto>) {
    const location = await this.findOne(id);
    if (dto.code && dto.code !== location.code) {
      const exists = await prisma.storageLocation.findUnique({ where: { code: dto.code } });
      if (exists) throw new ConflictException(`Location code ${dto.code} already exists.`);
    }
    return await prisma.storageLocation.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await prisma.rawMaterial.updateMany({
      where: { storageLocationId: id },
      data: { storageLocationId: null },
    });
    return await prisma.storageLocation.delete({ where: { id } });
  }
}
