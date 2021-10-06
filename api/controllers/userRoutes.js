const express = require('express');
const router = express.Router();
const joi = require('joi');
const User = require('../models/user')

const authenticateToken = require('../middleware/tokenAuth')

// user index route

router.get('/', authenticateToken, async (req, res) => {
    try {
        const users = await User.all
        res.json({ users })
    } catch (err) {
        res.status(500).json({ err })
    }
})

// user show route
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        res.json(user)
    } catch (err) {
        res.status(404).json({ err })
    }
})

// Create User route
router.post('/', authenticateToken, async (req, res) => {
    try {
        const user = await User.create(req.body.name, req.body.hash) // returns new user
        res.json(user)
    } catch (err) {
        res.status(404).json({ err })
    }
})

// get all habits for specific user route 
// ?? are we using this ??
router.get('/:id/habits', authenticateToken, async (req, res) => {
    try {
        const habits = await User.habits(req.body.id);
        res.json(habits)
    } catch (err) {
        res.status(404).json({ err })
    }
})


// add user habit router
// ?? are we using this ??
router.post('/:id/habits', authenticateToken, async (req, res) => {
    try {
        // form will have action to this page with input names "name", "frequency"
        const habits = await User.habits(req.body.id, req.body.name, req.body.frequency);
        res.json(habits)
    } catch (err) {
        res.status(404).json({ err })
    }
})

// update weekly count for habit
router.post('/:id/habits', authenticateToken, async (req, res) => {
    try {
        const currentCount = await User.updateCount(req.params.id);
        res.send(currentCount)
    } catch (err) {
        res.status(404).json({ err })
    }
})

// update 



// findHabitsForUser
router.get('/:email/choose_habits', authenticateToken, async (req, res) => {
    try {
        const allHabits = await User.findHabitsForUser(req.params.email);
        console.log(allHabits);
        res.status(200).send(allHabits)
    } catch (err) {
        res.status(404).json({ err })
    }
})

// updateHabitsForUser
router.patch('/:email/choose_habits', async (req, res) => {
    try {
        
        // const data2 = {
        //     "habitName": req.body.habitName,
        //     "frequency": req.body.frequency
        // }
        // const schema = joi.object({
        //     habitName: joi.string().min(2).max(200).required(),
        //     frequency: joi.number().integer().required()
        // })
        // const result = schema.validate(data2)
        // if (result.error) {
        //     console.log(result.error.details[0].message)
        //     return res.send(result.error.details[0])
        // }
        const updatedHabits = await User.updateHabitsForUser(req.body.email, req.body.newHabitsArr);
        // console.log(req.body.email);
        // console.log(req.body.habitName);
        res.status(200).send(updatedHabits)
    } catch (err) {
        res.status(404).json({ err })
    }
})

router.get('/:email/dashboard', authenticateToken, async (req, res) => {
    try {
        const weekDataTotal = await User.findWeekDataTotal(req.params.email)
        res.status(200).send(weekDataTotal)
    } catch (err) {
        res.status(404).json({ err })
    }
})

router.get('/:email/:habit/', authenticateToken, async (req, res) => {
    try {
        const dataHabit = await User.findDataHabit(req.params.email, req.params.habit)
        res.status(200).send(dataHabit)
    } catch (err) {
        res.status(404).json({ err })
    }
})

router.patch('/:email/:habit/update_dates', authenticateToken, async (req, res) => {
    try {

        const newDataHabit = await User.updateDataHabit(req.body.email, req.body.habit_name, req.body.completed_days)

        res.status(200).send(newDataHabit)

    } catch (err) {
        res.status(404).json({ err })
    }
})

router.delete('/:email/:habit/delete', authenticateToken, async (req, res) => {
    try {
        console.log(req.body.email)
        console.log(req.body.habit_name)
        
        const dataAfterDeleting = await User.deleteHabit(req.body.email, req.body.habit_name)

        res.status(200).send(dataAfterDeleting)

    } catch (err) {
        res.status(404).json({ err })
    }
})

module.exports = router

