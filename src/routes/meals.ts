import { randomUUID } from "crypto"
import { FastifyInstance } from "fastify"
import { knex } from '../database'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {

    app.post('/:user_id', {
        preHandler: [checkSessionIdExists],
    }, async (request, reply) => {
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

    app.get('/:user_id', {
        preHandler: [checkSessionIdExists],
    }, async (request, reply) => {
        try {
            const getMealsParamsSchema = z.object({
                user_id: z.string().uuid(),
            })
            
            const { user_id } = getMealsParamsSchema.parse(request.params)

            const meals = await knex('meals')
                .select('*')
                .where({ user_id })
            
            const totalMeals = meals.length

            const mealsOnOrOffDiet = await knex('meals')
                .select('*')
                .where({ user_id, on_diet: true })
                .orderBy('created_at', 'desc')

            const totalMealsOnDiet = mealsOnOrOffDiet.length
            const totalMealsOffDiet = totalMeals - totalMealsOnDiet

            let currentStreakCount = 0
            let bestStreakCount = 0

            mealsOnOrOffDiet.forEach((meal) => {
                if (meal.on_diet) {
                    currentStreakCount++

                    if (currentStreakCount > bestStreakCount) {
                        bestStreakCount = currentStreakCount
                    }
                } else {
                    currentStreakCount = 0
                }
            })

            return reply.status(200).send({
                meals,
                totalMeals: meals.length,
                totalMealsOnDiet,
                totalMealsOffDiet,
                currentStreakCount,
                bestStreakCount,
          })
        } catch (error) {
            console.error("Error while getting meals:", error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    })

    app.get('/:user_id/:meal_id', {
        preHandler: [checkSessionIdExists],
    }, async (request, reply) => {
        try {
            const getMealParamsSchema = z.object({
                user_id: z.string().uuid(),
                meal_id: z.string().uuid(),
            })
            
            const { user_id, meal_id } = getMealParamsSchema.parse(request.params)

            const meal = await knex('meals')
                .select('*')
                .where({ user_id, id: meal_id })
                .first()

            return reply.status(200).send(meal)
        } catch (error) {
            console.error("Error while getting meal:", error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    })

    app.delete('/:user_id/:meal_id', {
        preHandler: [checkSessionIdExists],
    }, async (request, reply) => {
        try {
            const deleteMealParamsSchema = z.object({
                user_id: z.string().uuid(),
                meal_id: z.string().uuid(),
            })
            
            const { user_id, meal_id } = deleteMealParamsSchema.parse(request.params)

            await knex('meals')
                .where({ user_id, id: meal_id })
                .delete()

            return reply.status(204).send()
        } catch (error) {
            console.error("Error while deleting meal:", error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    })

    app.put('/:user_id/:meal_id', {
        preHandler: [checkSessionIdExists],
    }, async (request, reply) => {
        try {
            const updateMealParamsSchema = z.object({
                user_id: z.string().uuid(),
                meal_id: z.string().uuid(),
            })
            
            const { user_id, meal_id } = updateMealParamsSchema.parse(request.params)

            const updateMealSchema = z.object({
                name: z.string(),
                description: z.string(),
                on_diet: z.boolean()
            })

            const { name, description, on_diet } = updateMealSchema.parse(request.body)

            const updateMeal = await knex('meals')
                .where({ user_id, id: meal_id })
                .update({
                    name,
                    description,
                    on_diet,
                })
            
            if (updateMeal === 0) {
                return reply.status(404).send({ error: 'Unauthorized' });
            }

            return reply.status(204).send()
        } catch (error) {
            console.error("Error while updating meal:", error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    })
}