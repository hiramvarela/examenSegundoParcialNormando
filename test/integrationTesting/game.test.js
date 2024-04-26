const GameModel = require("../../models/game.model").GameModel;
const UserModel = require("../../models/user.models").UserModel;
const ScoreboardModel = require("../../models/scoreboard.model").ScoreboardModel;

const { get } = require("mongoose");

const supertest = require('supertest');
const app = require('../../app');

describe(" La API deberá de cumplir con los siguientes servicios y validaciones", function () {
  describe.skip(" Deberá tener un registro de usuarios por medio del nombre, dicho servicio deberá devolver un identificador del usuario para utilizarlo en los siguientes servicios", function () {
    it("Crear usuario", function (done) {

      supertest(app)
        .post('/users/')
        .send({ usuarioName: 'Serchi' })
        .expect(201)
        .end(function (err, res) {
          if (err) return done(err);
          done();
        });
    });
    it('No debería aceptar nombres con caracteres especiales', async () => {
      supertest(app)
        .post('/users/')
        .send({ usuarioName: 'H1R@M' })
        .expect(500)
        .end(function (err, res) {
          if (err) return done(err);

        });
    });
  });


  describe.skip("Deberá tener un servicio jugar donde se le envié como parámetros el id del usuario y una palabra, la cual iniciará el juego", function () {
    it.skip('Deberá tener una prueba de integración que valide el envío del id del usuario y una palabra, la cual solo deberá contener letras', async () => {
      const response = await supertest(app)
        .post('/game/play')
        .send({ userId: '6626f7831994532604624211', word: 'oso' })
        .expect(200);
    }, 10000);

    it.skip('Deberá validar la respuesta del servicio en el juego en curso', async () => {
      const response = await supertest(app)
        .post('/game/play')
        .send({ userId: '66286d0e801dcdd291ebfb62', word: 'rojo' })
        .expect(200);

      expect(response.body).toHaveProperty("message", "Correct! Continue playing.");
    }, 10000);
    it.skip('Deberá  validar  que  si  la  respuesta  se  envía  después  de  20  segundos  en  el juego en curso, el jugador se le regresa el número de palabras que logro en ese juego y su posición en la tabla de jugadores', async () => {
      jest.useRealTimers();

      const promise = supertest(app)
        .post('/game/play')
        .send({ userId: "6626e4f42f2b7748955a8941", word: "normando" })


      jest.advanceTimersByTime(20000); // Simulate 20-second delay

      const response = await promise; // Await the promise only after the timer advance


      console.log(response.body);

      expect(response.status).toBe(200);
      expect(response.body.correctWordsCount).toBeDefined();
      expect(response.body.position).toBeDefined();
      expect(response.body.message).toBe("Time's up! Game over.");

      jest.useRealTimers();
    });


  });
  describe.skip("Deberá  tener  un  servicio  que  obtenga  las  primeras  diez  posiciones  junto  con  sus puntajes", function () {
    it('Deberá  tener  una  prueba  de  integración  que  valide  el  formato  de  la  tabla regresada', async () => {
      const response = await supertest(app)
        .get('/scoreboard/getTopPlayers')
        .expect(200); 
      console.log(response.body);
      expect(response.body.length).toBe(5);
    });
  });


});