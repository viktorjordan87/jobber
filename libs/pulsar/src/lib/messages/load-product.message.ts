import { IsString, IsNotEmpty, IsNumber, Min, IsInt, Max } from "class-validator";

export class LoadProductMessage {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsInt()
    @Min(0)
    stock: number;

    @IsNumber()
    @Min(0)
    @Max(5)
    rating: number;

    @IsString()
    @IsNotEmpty()
    description: string;
}