// models/game.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario',
        unique: true,  // Ensures that one user can have only one active game
        index: true  // Indexing on userId for faster querying
    },
    usuarioName: {
        type: Schema.Types.String,
        required: true,
        ref: 'Usuario'
    },
    currentWord: {
        type: String,
        required: true,
        match: /^[A-Za-z\u00C0-\u00FF]+$/ 
    },
    usedWords: [String], 
    score: {
        type: Number,
        default: 0 
    },
    isGameOver: {
        type: Boolean,
        default: false,
        index: true  // Indexing to quickly filter out non-active games
    },
    lastLetter: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        default: () => Date.now()
    }
});

const GameModel = mongoose.model('Game', gameSchema, 'games');

module.exports = GameModel;

