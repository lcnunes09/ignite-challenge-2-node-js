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

        let sessionId = request.cookies.sessionId

        if (!sessionId) {
            sessionId = randomUUID()

            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
            })
        }

        await knex('users')
            .insert({
                id: randomUUID(),
                email,
                name,
                image,
                session_id: sessionId,
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