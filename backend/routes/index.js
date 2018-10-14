var express = require('express');
var router = express.Router();
var db = require('../queries');

const validatePayloadMiddleware = (req, res, next) => {
    if (req.body) {
      next();
    } else {
      res.status(403).send({
        errorMessage: 'You need a payload'
      });
    }
  };

router.post('/api/iniciar', validatePayloadMiddleware, db.iniciar);
router.get('/api/authCookie', db.authCookie); // este es nuevo
router.get('/api/configuracion/cerrar', db.cerrar);


const authMiddleware = (req, res, next) => {
    if(req.session && req.session.idusuario) {
      next();
    } else {
      res.status(403).send({
        errorMessage: 'You must be logged in.'
      });
    }
  };

// nuevos endpoint
router.get( '/api/calendario/lista/calendarios', db.calendarioListaCalendario); 
router.get( '/api/calendario/lista/eventos', db.calendarioListaEventos);




// viejos
router.get( '/api/item/lista', authMiddleware, db.lista); 

// router.get( '/api/item/calendario', db.calendario); 
router.post('/api/item/nuevo', db.nuevo);
router.get( '/api/item/:id', db.getItem);
router.post('/api/item/actualizar/:id', db.actualizar);
router.post('/api/item/eliminar/:id', db.eliminar);

// application -------------------------------------------------------------
router.get('/', function (req, res) {

    res.render('index', {title: 'node-postgres-promises'}); // load the single view file (angular will handle the page changes on the front-end)
});

module.exports = router;