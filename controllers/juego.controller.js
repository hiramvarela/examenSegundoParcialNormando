// controllers/game.controller.js
const GameModel = require('../models/game.model');
const UserModel = require('../models/user.models');
const ScoreboardModel = require('../models/scoreboard.model');

// Banco de palabras
const words = [
    'amarillo', 'burro', 'casa', 'dátil', 'elefante', 'fresa', 'gato', 'huevo', 'iglesia',
    'jirafa', 'kiwi', 'limón', 'manzana', 'naranja', 'ñu', 'oso', 'pato', 'queso',
    'rosa', 'sapo', 'tigre', 'uva', 'vaca', 'wafle', 'xilófono', 'yate', 'zanahoria',
    'abogado', 'botella', 'caballo', 'dragón', 'estrella', 'flor', 'grúa', 'hielo',
    'isla', 'juego', 'kilo', 'luna', 'montaña', 'nube', 'oveja', 'puente', 'quemar',
    'ratón', 'sandía', 'televisor', 'universo', 'volcán', 'windsurf', 'xenón', 'yo-yo',
    'zapato', 'árbol', 'éxito', 'índigo', 'órgano', 'útil', 'niñez', 'joya', 'araña',
    'ensalada', 'idioma', 'orquesta', 'urgencia', 'equis', 'sandwich', 'quiosco'
];

function generateRandomWord(startingLetter) {
    let filteredWords;

    // Si no se proporciona startingLetter, usa todas las palabras
    if (!startingLetter) {
        filteredWords = words;
    } else {
        // Verificar si startingLetter es una letra válida
        if (!/^[a-zA-Z]$/.test(startingLetter)) {
            throw new Error("Invalid starting letter.");
        }

        // Filtrar palabras que comiencen con la letra proporcionada
        filteredWords = words.filter(word => word.toLowerCase().startsWith(startingLetter.toLowerCase()));

        // Si no hay palabras que comiencen con la letra inicial, lanzar un error
        if (filteredWords.length === 0) {
            throw new Error("No words start with the provided starting letter.");
        }
    }

    return filteredWords[Math.floor(Math.random() * filteredWords.length)] || null;
}

function isValidWord(userWord, lastLetter) {
    return userWord[0].toLowerCase() === lastLetter.toLowerCase();
}

/**
 * Calcula el puntaje del jugador basado en el número de palabras utilizadas.
 * @param {string[]} wordsArray - Arreglo de palabras usadas en el juego.
 * @returns {number} El puntaje calculado como la longitud del arreglo.
 */
function calculateScore(wordsArray) {
    return wordsArray.length;
}

async function getLastLetter(req, res) {
    try {
        const { gameId } = req.params;  // Obtiene el gameId de los parámetros de la URL
        const game = await GameModel.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }

        res.status(200).send({ lastLetter: game.lastLetter });
    } catch (error) {
        res.status(500).send({ message: "Error retrieving the last letter", error: error.toString() });
    }
}

async function createGame(req, res) {
    try {
        const { userId } = req.body;
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        // Check for an existing active game
        const existingGame = await GameModel.findOne({ userId: userId, isGameOver: false });
        if (existingGame) {
            return res.status(400).send({ message: "Active game already exists for this user" });
        }

        const currentWord = generateRandomWord(); 
        const lastLetter = currentWord.slice(-1);

        const newGame = new GameModel({
            userId: user._id,
            usuarioName: user.usuarioName,
            currentWord: currentWord,
            lastLetter: lastLetter,
            score: 0,
            isGameOver: false,
            startTime: new Date()
        });

        await newGame.save();
        res.status(201).send(newGame);
    } catch (error) {
        res.status(500).send({ message: "Error creating game", error: error.toString() });
    }
}

async function playGame(req, res) {
    try {
        const { userId, word } = req.body;
        
        // Retrieve the active game using userId
        const game = await GameModel.findOne({ userId: userId, isGameOver: false });
        if (!game) {
            return res.status(400).send({ message: "No active game found for this user" });
        }

        // Check if the game time has expired
        if (new Date() - game.startTime > 20000) { // Ensure the time is correctly handled in milliseconds
            game.isGameOver = true;
            await game.save();
            const userInfo = await getUserInfo(game.userId);
            return res.status(200).send({
                message: "Time's up! Game over.",
                userName: userInfo.usuarioName,
                correctWordsCount: game.score,
                position: userInfo.position
            });
        }

        // Validate the provided word
        if (!isValidWord(word, game.lastLetter)) {
            game.isGameOver = true;
            await game.save();
            const userInfo = await getUserInfo(game.userId);
            return res.status(200).send({
                message: "Invalid word! Game over.",
                userName: userInfo.usuarioName,
                correctWordsCount: game.score,
                position: userInfo.position
            });
        }

        // Add the valid word to the list of used words
        game.usedWords.push(word);
        const newWord = generateRandomWord(word.slice(-1));
        game.currentWord = newWord;
        game.lastLetter = newWord.slice(-1);
        game.score = game.usedWords.length;
        game.startTime = new Date();
        await game.save();

        await updateScoreboard(game.userId, 1);  // Only add 1 to the current score in the scoreboard for each correct word

        // Send the updated game state to the client
        res.status(200).send({
            message: "Correct! Continue playing.",
            game
        });
    } catch (error) {
        res.status(500).send({ message: "Error playing game", error: error.toString() });
    }
}



async function getUserInfo(userId) {
    const scoreboard = await ScoreboardModel.findOne();
    const userEntry = scoreboard.users.find(u => u.userId.equals(userId));
    return {
        usuarioName: userEntry.userName,
        position: scoreboard.users.findIndex(u => u.userId.equals(userId)) + 1
    };
}
async function updateScoreboard(userId, pointsToAdd) {
    try {
        // Verifica si existe algún registro de puntaje para el usuario
        let scoreboard = await ScoreboardModel.findOne({"users.userId": userId});

        if (scoreboard) {
            // Si el usuario ya está en el scoreboard, incrementa su puntaje
            await ScoreboardModel.updateOne(
                { "users.userId": userId },
                { "$inc": { "users.$.score": pointsToAdd } }
            );
        } else {
            // Si no existe un scoreboard o el usuario no está en él, crea uno o añade el usuario
            scoreboard = await ScoreboardModel.findOne();
            if (scoreboard) {
                // Si existe un scoreboard, añade el usuario a él
                await ScoreboardModel.updateOne(
                    { "_id": scoreboard._id },
                    { "$push": { "users": { userId: userId, score: pointsToAdd } } }
                );
            } else {
                // Crea un nuevo scoreboard si no existe ninguno
                scoreboard = new ScoreboardModel({
                    users: [{ userId: userId, score: pointsToAdd }]
                });
                await scoreboard.save();
            }
        }

        // Reordenar los usuarios en el scoreboard basado en el puntaje de manera descendente
        scoreboard = await ScoreboardModel.findOne(); // Recuperar el scoreboard actualizado
        if (scoreboard) {
            scoreboard.users.sort((a, b) => b.score - a.score); // Ordenar de mayor a menor puntaje
            await scoreboard.save(); // Guardar los cambios
        }
    } catch (error) {
        console.error("Error updating the scoreboard:", error);
        throw error; // Re-throw the error for further handling if needed
    }
}


module.exports = {
    createGame,
    playGame,
    getLastLetter,
    calculateScore,
    isValidWord,
    generateRandomWord
};

