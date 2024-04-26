const express = require('express');
const router = express.Router();

const {
    getTopPlayers,
    addUserToScoreboard,
    createScoreboard
} = require ('../controllers/scoreboard.controller')



router.post('/new-scoreboard', createScoreboard);
router.post('/addUser',addUserToScoreboard);
router.get('/getTopPlayers',getTopPlayers)

module.exports = router;
