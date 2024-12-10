const user = require('../models/userModel');

exports.getUser = async (req, reply) => {
    const users = await user.find();
    reply.view('user', { title: 'User', users });
};

exports.createUser = async (req, reply) => {
    const { name, email, password } = req.body;
    const newUser = new user({ name, email, password });
    await newUser.save();
    reply.send({ message: 'User created successfully', user: newUser });

};