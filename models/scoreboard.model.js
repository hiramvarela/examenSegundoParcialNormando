const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const scoreboardSchema = new Schema({
    users: [{
        userId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
        usuarioName: { type: String, required: true }, // Cambiado de userName a usuarioName
        score: { type: Number, required: true, default: 0 }
    }]
});

const ScoreboardModel = mongoose.model('Scoreboard', scoreboardSchema, 'scoreboard');

module.exports = ScoreboardModel;


