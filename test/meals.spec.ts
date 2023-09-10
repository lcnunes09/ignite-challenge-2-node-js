import { it, beforeAll, afterAll, describe, beforeEach, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
})

describe('Meals routes', () => {
    let user_id: string;
    let cookies: string[];

    beforeAll(async () => {
        await app.ready()

        execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest')

        const userResponse = await request(app.server)
            .post('/users')
            .send({
                email: 'test_user556@test.com',
                name: 'Test User',
                image: 'https://test.com/test.png',
            })

            cookies = userResponse.get('Set-Cookie')

            if (userResponse.status !== 201 || !userResponse.body.user_id) {
                throw new Error("Failed to create user for tests.");
            }

            user_id = userResponse.body.user_id

            console.log('User created with ID:', user_id);
            console.log('Cookies:', cookies);
    })

    beforeEach(() => {
        
    })

    afterAll(async () => {

        if (user_id) {
            await request(app.server).delete(`/users/${user_id}`)
            console.log(`User with ID ${user_id} deleted.`)
        } else {
            throw new Error("Failed to delete user for tests.");
        }

        await app.close()
    })

    it('it should be able to create a new meal', async () => {
        const response = await request(app.server)
            .post(`/meals/${user_id}`)
            .set('Cookie', cookies)
            .send({
                name: 'New meal',
                description: 'Description of the new meal',
                on_diet: true,
            })
            .expect(201)

            const meal_id = response.body.id

            console.log('Meal created with ID:', meal_id)

            await request(app.server)
            .delete(`/meals/${user_id}/${meal_id}`)
            .set('Cookie', cookies)
            .expect(204)
            .catch((e) => {
                console.log('Error during delete:', e);
            })
    })

    it('it should be able to edit a meal', async () => {
        const response = await request(app.server)
            .post(`/meals/${user_id}`)
            .set('Cookie', cookies)
            .send({
                name: 'New meal edit',
                description: 'Description of the new meal edit',
                on_diet: true,
            })
            .expect(201)

        const meal_id = response.body.id

        console.log('Meal created with ID:', meal_id)

        await request(app.server)
            .put(`/meals/${user_id}/${meal_id}`)
            .set('Cookie', cookies)
            .send({
                name: 'New meal edit',
                description: 'Description of the new meal edit',
                on_diet: false,
            })
            .expect(200)
            .catch((e) => {
                console.log('Error during edit:', e);
            })            
        
        const getEditedMeal = await request(app.server)
            .get(`/meals/${user_id}/${meal_id}`)
            .set('Cookie', cookies)
            .expect(200)
        
        expect(getEditedMeal.body).toEqual(
            expect.objectContaining({
                name: 'New meal edit',
                description: 'Description of the new meal edit',
                on_diet: 0,
            }),
        )

        console.log('Meal edited with ID:', meal_id)

        await request(app.server)
            .delete(`/meals/${user_id}/${meal_id}`)
            .set('Cookie', cookies)
            .expect(204)
            .catch((e) => {
                console.log('Error during delete:', e);
            })
    })

    it('it should be able to delete a meal', async () => {
        const response = await request(app.server)
            .post(`/meals/${user_id}`)
            .set('Cookie', cookies)
            .send({
                name: 'New meal delete',
                description: 'Description of the new meal delete',
                on_diet: true,
            })
            .expect(201)

        const meal_id = response.body.id

        console.log('Meal created with ID:', meal_id)

        await request(app.server)
            .delete(`/meals/${user_id}/${meal_id}`)
            .set('Cookie', cookies)
            .expect(204)
            .catch((e) => {
                console.log('Error during delete:', e);
            })
        
        console.log('Meal deleted with ID:', meal_id)
    })

    it ('it should be able to list all meals', async () => {
        const response = await request(app.server)
            .post(`/meals/${user_id}`)
            .set('Cookie', cookies)
            .send({
                name: 'New meal list',
                description: 'Description of the new meal list',
                on_diet: true,
            })
            .expect(201)

        const meal_id = response.body.id

        console.log('Meal created with ID:', meal_id)

        const listMeals = await request(app.server)
            .get(`/meals/${user_id}`)
            .set('Cookie', cookies)
            .expect(200)
        
        expect(listMeals.body).toEqual(
            expect.objectContaining({
                bestStreakCount: 1,
                currentStreakCount: 1,
                totalMeals: 1,
                totalMealsOffDiet: 0,
                totalMealsOnDiet: 1,
                meals: [{
                    id: meal_id,
                    user_id,
                    name: 'New meal list',
                    description: 'Description of the new meal list',
                    on_diet: 1,
                    created_at: expect.any(String),
                }]
            }),
        )

        console.log('Meals listed with ID:', meal_id)
    })
})
