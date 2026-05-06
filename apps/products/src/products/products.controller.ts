import { CreateProductRequest, ProductsServiceController, ProductsServiceControllerMethods } from "@jobber/grpc";
import { Controller, UseInterceptors } from "@nestjs/common";
import { GraphqlLoggingInterceptor } from "@jobber/graphql";
import { ProductsService } from "./products.service";
import { GrpcMethod } from "@nestjs/microservices";

@Controller('products') 
@ProductsServiceControllerMethods()
@UseInterceptors(GraphqlLoggingInterceptor)
export class ProductsController implements ProductsServiceController {
    constructor(private readonly productsService: ProductsService) {}

    @GrpcMethod('ProductsService', 'CreateProduct')
    async createProduct(product: CreateProductRequest) {
        return this.productsService.createProduct(product);
    }
}