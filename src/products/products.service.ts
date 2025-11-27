import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: createProductDto.name,
        description: createProductDto.description || null,
        price: createProductDto.price,
        category: createProductDto.category,
        isActive: createProductDto.isActive ?? true,
      },
    });
  }

  async getAllProducts() {
    return this.prisma.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
