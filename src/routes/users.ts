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

        const user_id = randomUUID(); 

        await knex('users')
            .insert({
                id: user_id,
                email,
                name,
                image,
                session_id: sessionId,
            })

        return reply.status(201).send({
            user_id
        })
    })

    app.get('/', async (request) => {
        const users = await knex('users')
            .select()

        return {
            users
        }
    })

    app.delete('/:user_id', async (request, reply) => {
        const deleteUsersParamsSchema = z.object({
            user_id: z.string().uuid(),
        })
        
        const { user_id } = deleteUsersParamsSchema.parse(request.params)

        await knex('users')
            .delete()
            .where({ id: user_id })

        return reply.status(204).send()
    })
}