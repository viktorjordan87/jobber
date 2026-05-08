import { PRODUCTS_PACKAGE_NAME, PRODUCTS_SERVICE_NAME, ProductsServiceClient } from "@jobber/grpc";
import { LoadProductMessage, PulsarClient, PulsarConsumer } from "@jobber/pulsar";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { Jobs } from '@jobber/nestjs';
import { ClientGrpc } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

@Injectable()
export class LoadProductsConsumer extends PulsarConsumer<LoadProductMessage> implements OnModuleInit{

    private productsService: ProductsServiceClient;

    constructor(pulsarClient: PulsarClient, @Inject(PRODUCTS_PACKAGE_NAME) private client: ClientGrpc) {
        super(pulsarClient, Jobs.LOAD_PRODUCTS);
    }
    async onModuleInit() {
        this.productsService = this.client.getService<ProductsServiceClient>(PRODUCTS_SERVICE_NAME);
        await super.onModuleInit();
    }

    protected async onMessage(data: LoadProductMessage): Promise<void> {
        await firstValueFrom(this.productsService.createProduct(data));
    }

}