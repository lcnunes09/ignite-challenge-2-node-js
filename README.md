# Daily Diet API

## Business Rules

- [x] It should be possible to create a user, with the following information: `name`, `image`, `email`, `create date`.
- [x] It should be possible to identify the user between requests: `session_id`
- [x] It should be possible to register a meal made, with the following information: `name`, `description`, `create date and time`, `is it on or off the diet`. The meals should be associated to a user.
- [ ] It should be possible to edit a meal, editing all information above, apart from the user.
- [x] It should be possible to delete a meal.
- [x] It should be possible to list all user meal.
- [x] It should be possible to see a specific meal.
- [ ] It should be possible to get user metrics, such as:
  - [ ] Total of meals created
  - [ ] Total of meals created that were on the diet
  - [ ] Total of meals created that were off the diet
  - [ ] Best streak days on the diet
- [ ] The user can only see, edit and delete the meals that their created
