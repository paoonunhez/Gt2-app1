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
  }

// nuevos endpoint pao
router.get( '/api/calendario/lista/calendarios', authMiddleware, db.calendarioListaCalendario); 
router.get( '/api/calendario/lista/eventos/hoy/:id_usuario_colab/:id_calendario', authMiddleware, db.calendarioListaEventosHoy);
router.get( '/api/calendario/lista/eventos/:id_calendario/:anho/:mes/:dia', authMiddleware, db.calendarioListaEventos);
router.get( '/api/calendario/lista/ver/turno/:id/:id_usuario_colab', authMiddleware, db.calendarioListaVerTurno);
router.get( '/api/calendario/lista/nuevo/detalles', authMiddleware, db.calendariosListaNuevoDetalles);
router.post( '/api/calendario/lista/nuevo/detalles/otros', authMiddleware, db.calendarioListaNuevoDetallesOtros);
router.get( '/api/configuracion/usuario/perfil/usuario/:id', authMiddleware, db.configuracionUsuarioPerfilUsuario);
router.get( '/api/configuracion/usuario/perfil/empresa', authMiddleware, db.configuracionUsuarioPerfilEmpresa);
router.post( '/api/configuracion/usuario/perfil/usuario/anhadir', authMiddleware, db.configuracionUsuarioPerfilUsuarioAnhadir);
router.get( '/api/configuracion/usuario/perfil/usuario/promover/:id', authMiddleware, db.configuracionUsuarioPerfilUsuarioPromover);
router.get( '/api/configuracion/usuario/perfil/usuario/eliminar/:id', authMiddleware, db.configuracionUsuarioPerfilUsuarioEliminar);
router.get( '/api/configuracion/calendario/tiempo/alerta', authMiddleware, db.configuracionCalendarioTiempoAlerta);
router.post( '/api/configuracion/calendario/actualizar/tiempo', authMiddleware, db.configuracionCalendarioActualizarTiempo);
router.post( '/api/configuracion/calendario/nuevo', authMiddleware, db.configuracionCalendarioNuevo);
router.get( '/api/obtener/calendario', authMiddleware, db.obteneCalendario);




// nuevos endpoint rod


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