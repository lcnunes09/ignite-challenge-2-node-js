import { Knex } from "knex";

declare module 'knex/types/tables' {
    export interface Tables {
        users: {
            id: string,
            session_id?: string,
            email: string,
            image: string,
            name: string,
            created_at: string,
        },
        meals: {
            id: string,
            user_id?: string,
            name: string,
            description: string,
            on_diet: boolean,
            created_at: string,
        }
    }
}