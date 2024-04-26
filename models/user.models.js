const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usuarioSchema = new Schema({
    usuarioName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        match: /^[a-zA-Z0-9]+$/  // Expresión regular para validar que solo contenga letras y números
    },
    score: {
        type: Number,
        default: 0  // Asegurar que el valor por defecto sea 0
    }
});

const UserModel = mongoose.model('Usuario', usuarioSchema, 'usuarios');

module.exports = UserModel;


