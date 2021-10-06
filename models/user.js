const { init } = require('../dbConfig/init')
const { ObjectId } = require('mongodb')
// const { currentWeekNumber } = require('current-week-number')
const dbName = 'habitsaddicts'
class User {
    constructor(data) {
        this.id = data.id
        this.username = data.username
        this.email = data.email
        this.hash = data.hash // hash == hashed password
        this.habits = data.habits
    }

    // grab all users. may not need this
    static get all() {
        return new Promise(async (resolve, reject) => {
            try {
                const client = await init()
                const userData = await client(dbName).collection('users').find().toArray()
                //mongodb gives a guid to each new insertion _id even though not explicit in schema
                client.close() //close db after each connection since only can have 500
                const users = userData.map(u => new User({ ...u, id: u._id })) // create new user to access the methods e.g. delete etc.
                resolve(users);
            } catch (err) {
                console.log(err);
                reject("Error retrieving users")
            }
        })
    }

    // grab single user
    // ??  are we using this ??
    static findByEmail(email) {
        return new Promise(async (resolve, reject) => {
            try {
                const client = await init();
                //_id is actually an object, ObjectId(id)
                let userData = await client.db(dbName).collection('users').find({ email: { $eq: email } }).toArray();
                console.log(userData);
                // let user = new User({ ...userData[0], id: userData[0]._id });
                // console.log(user);
                let user = userData[0];
                resolve(user);
                client.close()
            } catch (err) {
                console.log(err);
                reject('User not found');
            }
        });
    }

    static create(name, email, hash) {
        return new Promise(async (resolve, reject) => {
            try {
                const client = await init();
                let userData = await client.db(dbName).collection('users').insertOne({ username: name, email: email, hash: hash })
                console.log(userData);
                let newUser = new User(userData); // .rows
                client.close()
                resolve(newUser);
            } catch (err) {
                reject('Error creating user');
            }
        });
    }
    // ?? are we using this ??
    get habitsList() {
        return new Promise(async (resolve, reject) => {
            try {
                const client = await init();
                const user = await client.db(dbName).collections('users').find({ _id: ObjectId(this.id) }); //mongo stores id as object
                const userHabits = user["habits"]; // user['habits'] should be stored in db as array we can push objects to
                resolve(userHabits);
            } catch (err) {
                reject('User not found');
            }
        });
    }

    //creates habit for single user
    // ?? are we using this ??
    static createHabit(userId, name, frequency) {
        return new Promise(async (resolve, reject) => {
            try {
                const client = await init();
                const user = await client.db(dbName).collections('users').find({ _id: ObjectId(userId) });
                const userHabitsData = user["habits"];
                userHabitsData.push({ name: name, frequency: frequency })
                resolve(userHabitsData); //check if updates have been made
            } catch (err) {
                reject('Error creating user');
            }
        });
    }


    // --- get list of habits with frequencies by user's email
    static findHabitsForUser(email) {
        return new Promise(async (resolve, reject) => {
            try {
                const client = await init();
                const user = await client.db(dbName).collection('users').find(({ email: { $eq: email } })).toArray();//.project({ email: 1, habits: 1 })
                const userHabits = { email: "", habits: {} } // object for response
                userHabits.email = user[0].email
                userHabits.habits = user[0].habits.map((a) => { return { habit_name: a.habit_name, frq: a.frequency } })
                resolve(userHabits);
            } catch (err) {
                reject("Users habits could not be found");
            };
        });
    };

    static deleteUserHabit(email, habitNum) {
        return new Promise(async (resolve, reject) => {
            try {
                const client = await init();
                const user = await client.db(dbName).collection('users').find(({ email: { $eq: email } })).toArray();//.project({ email: 1, habits: 1 })
                const userHabits = { email: "", habits: {} } // object for response
                userHabits.email = user[0].email
                userHabits.habits = user[0].habits.map((a) => { return { habit_name: a.habit_name, frq: a.frequency } })
                userHabits.habits.pop(habitNum - 1) // removes habit from habit
                resolve(userHabits);
            } catch (err) {
                reject("Users habits could not be found");
            };
        });
    };


    // --- update list of habits with frequencies by user's email

    static updateHabitsForUser(email, arrayOfNewHabits) {

        return new Promise(async (resolve, reject) => {
            try {
                const client = await init();
                await arrayOfNewHabits.forEach( async (habit) => { 
                    await client.db(dbName).collection('users').findOneAndUpdate({ email: { $eq: email } }, {
                        "$push": {
                            "habits":
                            {
                                "habit_name": habit.habitName,
                                "frequency": habit.frequency,
                                "completed_days": [0, 0, 0, 0, 0, 0, 0]
                            }
                        },
                    }
                    )
                });
                resolve("Habits were added");
                
            } catch (err) {
                reject("Users habits could not be found");
            };
        });
    };



    // --- get list of habits with frequencies and completed_count for week  by user's email
    static findWeekDataTotal(email) {
        return new Promise(async (resolve, reject) => {
            try {

                const client = await init();
                const user = await client.db(dbName).collection('users').find(({ email: { $eq: email } })).toArray();//.project({ email: 1, habits: 1 })
                const userDataTotal = { email: "", habits: {} } // object for response
                userDataTotal.email = user[0].email



                userDataTotal.habits = user[0].habits.map((a) => { return { habit_name: a.habit_name, frq: a.frequency, count: a.completed_days.reduce((total, el) => { return total + el }, 0) } })
                //userDataTotal.habits = user[0].habits.map((a) => { return { habit_name: a.habit_name, frq: a.frequency, count: a.completed_days} })




                client.close()
                resolve(userDataTotal);
            } catch (err) {
                reject("Data for this week could not be found");
            }
        })


    }

    // ---- for Habit page - single habit by habit_name, email  - return days of the week when completed
    static findDataHabit(email, habitName) {
        return new Promise(async (resolve, reject) => {
            try {
                const client = await init();
                const user = await client.db(dbName).collection('users').find(({ email: { $eq: email } })).toArray();//.project({ email: 1, habits: 1 })
                const userDataHabit = { email: "", habit: {} } // object for response
                userDataHabit.email = user[0].email
                //userDataHabit.habit = user[0].habits.map((a) => { return { habit_name: a.habit_name, frq: a.frequency,count: a.completed_days.reduce((total, el) => {return total+el}, 0) } })
                client.close()
                const findHabitByName = (habits, name) => {
                    const result = habits.filter(a => {
                        return a['habit_name'] === name;
                    });
                    return result;
                };
                userDataHabit.habit = findHabitByName(user[0].habits, habitName)
                resolve(userDataHabit)
            } catch (err) {
                reject("Data for this week could not be found");
            };
        });
    };

    // --------- for Habit page -  update single habit by habit_name, email  - return new days of the week when completed-- 

    static updateDataHabit(email, habitName, newDaysCompleted) {
        return new Promise(async (resolve, reject) => {
            try {
                const client = await init();
                const user = await client.db(dbName).collection('users').find(({ email: { $eq: email } })).toArray();
                const habitToChangeIndex = user[0].habits.findIndex(({ habit_name }) => habit_name === habitName);
                const userUpdated = user
                userUpdated[0].habits[`${habitToChangeIndex}`].completed_days = newDaysCompleted
                console.log("updated ", userUpdated[0].habits)
                const userTest = await client.db(dbName).collection('users').findOneAndUpdate({ email: { $eq: email } }, { $set: { habits: userUpdated[0].habits } }, { returnDocument: "after" }, { returnOriginal: false })
                resolve(userTest)
            } catch (err) {
                reject("Data could not be found");
            };
        });
    };

    //   ----   delet one habit for user with email
    static deleteHabit(email, habitName) {
        return new Promise(async (resolve, reject) => {
            try {
                const client = await init();
                const user = await client.db(dbName).collection('users').find(({ email: { $eq: email } })).toArray();
                console.log(user)
                const habitToChangeIndex = user[0].habits.findIndex(({ habit_name }) => habit_name === habitName);
                const userUpdated = user
                userUpdated[0].habits.splice(`${habitToChangeIndex}`, 1)

                console.log("updated ", userUpdated[0].habits)
                const updatedUser = await client.db(dbName).collection('users').findOneAndUpdate({ email: { $eq: email } }, { $set: { habits: userUpdated[0].habits } }, { returnDocument: "after" }, { returnOriginal: false })

                resolve(updatedUser)
            } catch (err) {
                reject("Data could not be found");
            };
        });
    };



}



module.exports = User;