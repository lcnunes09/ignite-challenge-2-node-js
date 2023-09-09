import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'


export async function usersRoutes(app: FastifyInstance) {
    app.post('/', async (request, reply) => {
        const createUsersSchema = z.object({
            email: z.string().email(),
            name: z.string(),
            image: z.string().url(),
        })
            
        const { email, name, image } = createUsersSchema.parse(request.body)

        await knex('users')
            .insert({
                id: randomUUID(),
                email,
                name,
                image,
                created_at: new Date(),
            })

        return reply.status(201).send()
    })

    app.get('/', async (request) => {
        const users = await knex('users')
            .select()

        return {
            users
        }
    })
}