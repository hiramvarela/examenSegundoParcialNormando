// controllers/user.controller.js
const UserModel = require('../models/user.models');

async function createUser(req, res) {
    try {
        const { usuarioName, score } = req.body;  // score es opcional

        // Crear un nuevo usuario con el usuarioName y score proporcionado o usar el valor por defecto de score
        const newUser = new UserModel({
            usuarioName,
            score  // Aún si score no está en la solicitud, el modelo asigna un valor por defecto
        });

        await newUser.save();
        res.status(201).send(newUser);
    } catch (error) {
        res.status(500).send({ message: "Nombre de usuario invalido", error: error.toString() });
    }
}

module.exports = {
    createUser
    
};

