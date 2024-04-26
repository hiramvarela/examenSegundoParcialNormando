var createError = require('http-errors');
const gameController = require('../controllers/juego.controller');

const httpMocks = require('node-mocks-http');
const { getLastLetter, generateRandomWord ,calculateScore} = require('../controllers/juego.controller');

// Mock de GameModel
jest.mock('../models/user.models', () => ({
    findById: jest.fn(),
    findOne: jest.fn(),
    updateOne: jest.fn()
}));

jest.mock('../models/game.model', () => {
    return {
        findById: jest.fn(),
        findOne: jest.fn(),
        updateOne: jest.fn()
    };
});
const UserModel = require('../models/user.models');
const GameModel = require('../models/game.model');

describe("La API deberá de cumplir con los siguientes funciones internas y validaciones", function () {
    describe.skip('Deberá tener una función que obtenga la última letra de la palabra enviada como parámetro', () => {
        beforeEach(() => {
            // Reset mocks before each test
            GameModel.findById.mockClear();
            GameModel.findOne.mockClear();
            GameModel.updateOne.mockClear();
        });

        it('Prueba unitaria que valide que la función siempre trae la palabra correcta otorgada', async () => {
            GameModel.findById.mockResolvedValue({ lastLetter: 'e' });

            const req = httpMocks.createRequest({
                method: 'GET',
                url: '/game/507f1f77bcf86cd799439011',
                params: {
                    gameId: '507f1f77bcf86cd799439011'
                }
            });
            const res = httpMocks.createResponse();

            await getLastLetter(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getData()).toEqual({ lastLetter: 'e' });
        });
        it('Implementar pruebas que valide parámetros', async () => {
            const req = httpMocks.createRequest({
                method: 'POST',
                url: '/game/play',
                params: {
                    userId: '507f1f77bcf86cd799439011',
                    word: 'elefante'

                }
            });
            const res = httpMocks.createResponse();
      
            await getLastLetter(req, res);
      
            expect(res.statusCode).toBe(200);
            const responseBody = res._getData();
            expect(responseBody).toEqual(expect.objectContaining({ lastLetter: 'e' }));
        });

    });
    describe.skip('Deberá tener una función que regrese una palabra que comience con la letra otorgada', () => {
        it('Prueba unitaria que valide que siempre devuelva una palabra que inicie con la letra otorgada', () => {
            const words = ['apple', 'apricot', 'banana', 'blueberry', 'avocado'];
            const word = generateRandomWord('a', words);
            expect(word.toLowerCase()).toMatch(/^a/i);
        });
        it('Implementar pruebas que valide parámetros ', async () => {
            const lastLetter = 'e';
            const words = ['ensalada', 'estrella', 'banana', 'blueberry', 'avocado'];
            const word = generateRandomWord(lastLetter, words);
            expect(word.toLowerCase()).toMatch(/^e/i);
            
        });
    
    
    });  
    describe.skip('Deberá  tener  una  función  que  calcule  el  puntaje  del  jugador  con  cada  palabra  que devuelva,  este  puntaje  deberá  ser  basado  en  el  conteo  del  arreglo  de  palabras  que  se han utilizado en el juego', () => {
        it('Prueba unitaria que reciba como parámetro un arreglo y devuelva la longitud  del mismo', () => {
            const words = ['amarillo', 'burro', 'casa', 'dátil', 'elefante', 'fresa', 'gato', 'huevo', 'iglesia'];
    
            expect(calculateScore(words)).toBe(9);
        });
    });  
});
