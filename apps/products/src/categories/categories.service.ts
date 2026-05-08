import { Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DATABASE_CONNECTION } from "../database/database-connection";
import * as categoriesSchema from './schema';
import { eq } from "drizzle-orm";

@Injectable() 
export class CategoriesService {
    constructor(
        @Inject(DATABASE_CONNECTION) private readonly database: NodePgDatabase<typeof categoriesSchema>) {    
    }

    async createCategory(category: Omit<typeof categoriesSchema.categories.$inferSelect, 'id'>) {
        await this.database.insert(categoriesSchema.categories).values({...category});
    }

    async getCategoryByName(name: string) {
        return this.database.query.categories.findFirst({
            where: eq(categoriesSchema.categories.name, name),
        });
    }
}