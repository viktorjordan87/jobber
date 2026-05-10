import {
  JOBS_PACKAGE_NAME,
  PRODUCTS_PACKAGE_NAME,
  PRODUCTS_SERVICE_NAME,
  ProductsServiceClient,
} from '@jobber/grpc';
import { LoadProductMessage, PulsarClient } from '@jobber/pulsar';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Jobs } from '@jobber/nestjs';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JobsConsumer } from '../jobs.consumer';

@Injectable()
export class LoadProductsConsumer
  extends JobsConsumer<LoadProductMessage>
  implements OnModuleInit
{
  private productsService: ProductsServiceClient;

  constructor(
    pulsarClient: PulsarClient,
    @Inject(PRODUCTS_PACKAGE_NAME) private clientProducts: ClientGrpc,
    @Inject(JOBS_PACKAGE_NAME) private clientJobs: ClientGrpc,
  ) {
    super(Jobs.LOAD_PRODUCTS, pulsarClient, clientJobs);
  }
  async onModuleInit() {
    this.productsService =
      this.clientProducts.getService<ProductsServiceClient>(
        PRODUCTS_SERVICE_NAME,
      );
    await super.onModuleInit();
  }

  protected async execute(data: LoadProductMessage): Promise<void> {
    await firstValueFrom(this.productsService.createProduct(data));
  }
}
