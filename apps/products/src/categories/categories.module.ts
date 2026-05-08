import { CategoriesService } from "./categories.service";
import { Module } from "@nestjs/common";


@Module({
    providers: [CategoriesService],
    exports: [CategoriesService],
})
export class CategoriesModule {}