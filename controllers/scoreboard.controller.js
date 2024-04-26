// controllers/scoreboard.controller.js
const ScoreboardModel = require('../models/scoreboard.model');
const UserModel = require('../models/user.models');  // Importar el modelo de Usuario para la población.

// Crear un nuevo scoreboard
async function createScoreboard(req, res) {
    try {
        // Verificar si ya existe un scoreboard
        const existingScoreboard = await ScoreboardModel.findOne();
        if (existingScoreboard) {
            return res.status(400).send({ message: "A scoreboard already exists." });
        }

        const newScoreboard = new ScoreboardModel({
            users: []
        });

        await newScoreboard.save();
        res.status(201).send(newScoreboard);
    } catch (error) {
        res.status(500).send({ message: "Error creating scoreboard", error: error.toString() });
    }
}

// Agregar o actualizar un usuario en el scoreboard
async function addUserToScoreboard(req, res) {
    try {
        const { userId } = req.body;
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        const scoreboard = await ScoreboardModel.findOne();
        if (!scoreboard) {
            return res.status(404).send({ message: "Scoreboard not found" });
        }

        let userEntry = scoreboard.users.find(u => u.userId.equals(userId));
        if (userEntry) {
            // Actualizar el usuarioName y score si el usuario ya existe en el scoreboard
            userEntry.usuarioName = user.usuarioName; // Cambiado de userName a usuarioName
            userEntry.score = req.body.score || userEntry.score; // Actualizar el score solo si se proporciona uno nuevo
        } else {
            // Añadir un nuevo usuario si no existe
            scoreboard.users.push({ userId: user._id, usuarioName: user.usuarioName, score: req.body.score || 0 });
        }

        // Ordenar usuarios por score de forma descendente
        scoreboard.users.sort((a, b) => b.score - a.score);

        await scoreboard.save();
        res.status(200).send(scoreboard);
    } catch (error) {
        res.status(500).send({ message: "Error adding user to scoreboard", error: error.toString() });
    }
}

// Obtener los 10 usuarios top del scoreboard
async function getTopPlayers(req, res) {
    try {
        const scoreboard = await ScoreboardModel.findOne().populate({
            path: 'users.userId',
            select: 'usuarioName score'  // Asegúrate de que los campos son correctos según tu modelo de Usuario
        });

        if (!scoreboard) {
            return res.status(404).send({ message: "Scoreboard not found" });
        }

        // Mapear los resultados para devolver solo los campos requeridos
        const topPlayers = scoreboard.users.slice(0, 10).map(player => ({
            usuarioName: player.usuarioName,
            score: player.score,
            _id: player._id
        }));

        // Enviar los primeros 10 usuarios ordenados con los campos especificados
        res.status(200).send(topPlayers);
    } catch (error) {
        res.status(500).send({ message: "Error retrieving top players", error: error.toString() });
    }
}


module.exports = {
    createScoreboard,
    addUserToScoreboard,
    getTopPlayers
};


