const express = require('express');
const router = express.Router();
const {
    createGame,
    playGame,
    getLastLetter
} = require('../controllers/juego.controller');

router.post('/new-game',createGame);

router.post('/play',playGame);

router.get('/get/:gameId',getLastLetter);

module.exports = router;

