const express = require('express');
const router = express.Router();
const {  createUser } = require('../controllers/user.controller');  // Asegúrate de que los nombres coincidan.



// Ruta para crear un usuario
router.post('/', createUser);

module.exports = router;


