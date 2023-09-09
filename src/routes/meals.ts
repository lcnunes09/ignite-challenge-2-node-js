import { randomUUID } from "crypto"
import { FastifyInstance } from "fastify"
import { knex } from '../database'
import { z } from 'zod'

export async function mealsRoutes(app: FastifyInstance) {

    app.post('/:user_id', async (request, reply) => {
        try {
            const createMealsSchema = z.object({
                name: z.string(),
                description: z.string(),
                on_diet: z.boolean()
            })
            
            const createMealsParamsSchema = z.object({
                 user_id: z.string().uuid(),
            })
            
            const { user_id } = createMealsParamsSchema.parse(request.params)
            
            const { name, description, on_diet } = createMealsSchema.parse(request.body)

            await knex('meals')
                .insert({
                    id: randomUUID(),
                    user_id,
                    name,
                    description,
                    on_diet,
                })

            return reply.status(201).send()
        } catch (error) {
            console.error("Error while inserting a new meal:", error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    })

    app.get('/:user_id', async (request, reply) => {
        try {
            const getMealsParamsSchema = z.object({
                user_id: z.string().uuid(),
            })
            
            const { user_id } = getMealsParamsSchema.parse(request.params)

            const meals = await knex('meals')
                .select('*')
                .where({ user_id })

            return reply.status(200).send(meals)
        } catch (error) {
            console.error("Error while getting meals:", error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    })
}