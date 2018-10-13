var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://postgres:123456@localhost:5432/App1';
var db = pgp(connectionString);

/*
*/
function iniciar(req, res, next) {
  //query a la base de datos
  db.one('SELECT id, usuario, id_persona  '+
          'FROM usuarios '+
          'WHERE usuario like $1 '+
          'AND password like $2 '+
          'AND estado = 3;',
    // parametros para la query
    [req.body.usuario, req.body.password])
    .then(function (data) {
      // //cookie idusuario
      req.session.idusuario = data.id;
      //respuesta al cliente
      res.status(200)
        .json({
          estado: true,
          data: data.id //este es el dato que se retorna al cliente
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function cerrar(req, res, next) {
  try{
    req.session.destroy()
    res.status(200)
      .json({
        estado: true,
        data: 'exito'
      });
  } catch(err){}
}

function authCookie(req, res, next) {
  req.session.idusuario ? res.status(200).send({estado: true}) : res.status(200).send({estado: false});
}

function calendario(req, res, next) {
  
  try{
    if(req.session.idusuario){
      // preparar parametros
      
      // consultar bd
      db.any(`SELECT a.id, a.id_calendario, a.nombre, a.fecha_inicio  
             a.fecha_fin, a.id_usuario_colab, b.id_equipo, b.nombre 
             FROM eventos a, calendarios b 
             WHERE fecha_inicio = $1;`,
        [req.session.idusuario, req.params.fecha_inicio])
        .then(function (data) {
          res.status(200)
            .json(data);
        })
        .catch(function (err) {
          return next(err);
        });
    } else {
      res.status(404)
      .json({
        estado: false
      });
    }
  } catch(err){}
}






function lista(req, res, next) {
  try{
    if(req.session.idusuario){
      // preparar parametros
      
      // consultar bd
      db.any(' SELECT id, descripcion '+
              'FROM tareas '+
              'WHERE idusuario = $1;',
        [req.session.idusuario])
        .then(function (data) {
          // console.log(data);
          res.status(200)
            .json(data);
        })
        .catch(function (err) {
          return next(err);
        });
    } else {
      res.status(404)
      .json({
        estado: false
      });
    }
  } catch(err){}
}

function nuevo(req, res, next) {
  try{
    if(req.session.idusuario){
      // preparar parametros
      
      //consultar bd
      db.none('INSERT INTO tareas(descripcion, idusuario) '+
            'VALUES ($1, $2);',
        [req.body.descripcion, req.session.idusuario])
        .then(function () {
          res.status(200)
            .json({
              estado: true,
            });
        })
        .catch(function (err) {
          return next(err);
        });
    } else {
      res.status(404)
      .json({
        estado: false
      });
    }
  } catch(err){}
}

function getItem(req, res, next) {
  try{
    if(req.session.idusuario){
      // preparar parametros
      
      // consultar bd
      db.one(' SELECT id, descripcion '+
              'FROM tareas '+
              'WHERE id = $1;',
        [req.params.id])
        .then(function (data) {

          res.status(200)
            .json(data);
        })
        .catch(function (err) {
          return next(err);
        });
    } else {
      res.status(404)
      .json({
        estado: false
      });
    }
  } catch(err){}
}

function actualizar(req, res, next) {
  try{
    if(req.session.idusuario){
      // preparar parametros
      
      // consultar bd
      db.none(' UPDATE tareas '+ 
              ' SET descripcion=$1 '+
              ' WHERE id = $2;',
        [req.body.descripcion, req.params.id])
        .then(function () {
          res.status(200)
            .json({
              estado: true,
            });
        })
        .catch(function (err) {
          return next(err);
        });
    } else {
      res.status(404)
      .json({
        estado: false
      });
    }
  } catch(err){}
}

function eliminar(req, res, next) {
  try{
    if(req.session.idusuario){
      // preparar parametros
      
      // consultar bd
      db.none(' DELETE FROM tareas WHERE id = $1;',
        [req.params.id])
        .then(function () {
          res.status(200)
            .json({
              estado: true,
            });
        })
        .catch(function (err) {
          return next(err);
        });
    } else {
      res.status(404)
      .json({
        estado: false
      });
    }
  } catch(err){}
}

module.exports = {
  iniciar: iniciar,
  cerrar: cerrar,
  calendario:calendario,

  lista: lista,
  nuevo: nuevo,
  getItem: getItem,
  actualizar: actualizar,
  eliminar: eliminar,
  authCookie: authCookie
};
