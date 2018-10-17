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
  db.one(`SELECT id, usuario, id_persona, id_perfil 
          FROM usuarios 
          WHERE usuario like $1
          AND password like $2 
          AND estado = 3;`,
    // parametros para la query
    [req.body.usuario, req.body.password])
    .then(function (data) {
      // //cookie idusuario

      req.session.idusuario = data.id;
      req.session.idperfil = data.id_perfil;
      
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

function calendarioListaCalendario(req, res, next) {
  try{
    if(req.session.idusuario){
      // preparar parametros
      
      // consultar bd 

      db.any(`SELECT a.id, a.nombre
               FROM calendarios a, usuarios b 
               WHERE b.id = $1;`,
        [req.session.idusuario])
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

function calendarioListaEventosHoy(req, res, next) {
  try{
    if(req.session.idusuario){
      // preparar parametros     
      let calendario = parseInt(req.params.id_calendario);
      
      

      // verificar perfil
      let query=``;
      if(req.session.idperfil==1)
      { //sup
        query = `SELECT  a.id as id,
                    to_char(a.fecha_inicio,'YYYY-MM-DD HH24:MM') as fecha, 
                    concat (p.nombre, ' ', p.apellido, ' | ', u.nombre) as nombre
                    FROM    eventos a, ubicaciones u, personas p
                    WHERE   a.id_ubicacion = u.id and 
                    a.id_usuario_colab = $1 and
                    to_char(a.fecha_inicio,'YYYY-MM-DD')= to_char(now(), 'YYYY-MM-DD') and
                    a.id_calendario= $2
                `;
      } else 
      { //miembro
        query =`SELECT  a.id as id,
                    concat (a.nombre, ' | ', u.nombre ) as Turno,
                    to_char(a.fecha_inicio,'YYYY-MM-DD HH24:MM') as fecha
                    FROM    eventos a, ubicaciones u
                    WHERE   a.id_ubicacion = u.id and 
                    a.id_usuario_colab =$1 and
                    to_char(a.fecha_inicio,'YYYY-MM-DD')= to_char(now(), 'YYYY-MM-DD') and
                    a.id_calendario=$2
                `;
      }
      // consultar bd
      db.any(query,
        [req.session.idusuario, calendario])
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


function calendarioListaEventos(req, res, next) {
  try{
    if(req.session.idusuario){
      // preparar parametros     
      
      let calendario = parseInt(req.params.id_calendario);
      
    

      // verificar perfil
      let query=``;
      if(req.session.idperfil==1)
      { //sup
        query = `SELECT a.id, 
                        a.id_calendario, 
                        concat (p.nombre, ' ', p.apellido, ' | ', u.nombre) as nombre
                        to_char(a.fecha_inicio,'YYYY-MM-DD HH24:MM') as fecha,
                 FROM eventos am eventos a, ubicaciones u, personas p
                 WHERE a.id_ubicacion = u.id and   
                      a.id_usuario_colab =$1 and
                      to_char(a.fecha_inicio,'YYYY-MM-DD') = $2 and 
                      a.id_calendario=$3
               ;`
      } else 
      { //miembro
        query =`SELECT a.id, 
                      a.id_calendario, 
                      concat (a.nombre, ' | ', u.nombre ) as Turno,
                      to_char(a.fecha_inicio,'YYYY-MM-DD HH24:MM') as fecha,
                FROM eventos a, eventos a, ubicaciones u, personas p
                WHERE a.id_ubicacion = u.id and   
                      a.id_usuario_colab =$1 and
                      to_char(a.fecha_inicio,'YYYY-MM-DD') = $2 and 
                      a.id_calendario=$3
               ;`
      }
      // consultar bd
      db.any(query,
        [req.session.idusuario, calendario])
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


function nuevoListaEventos(req, res, next) {
  try{
    if(req.session.idusuario){
      // preparar parametros
      
      //consultar bd
      
       // verificar perfil
       let query=``;
       if(req.session.idperfil==1)
       { //sup
        
         query = `INSERT INTO eventos ( id_calendario, nombre, fecha_inicio, repetir, 
                                        tiempo_alerta, id_usuario_colab, color, margen_entrada, margen_salida, 
                                        id_ubicacion, fecha_fin)
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                  ;`
                  
       }  else 
       {
        res.status(403)
        .json({
          estado: false,
          data: "no posee permiso"
       });
      }
      db.none(
        query,
        [req.body.id_calendario, req.body.nombre, req.body.fecha_inicio, req.body.repetir,
          req.body.tiempo_alerta, req.body.id_usuario_colab, req.body.color,req.body.margen_entrada, req.body.margen_salida,
           req.body.id_ubicacion, req.body.fecha_fin, req.session.idusuario])
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


// viejos

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
  // nuevos
  calendarioListaCalendario:calendarioListaCalendario,
  calendarioListaEventosHoy:calendarioListaEventosHoy,
  calendarioListaEventos:calendarioListaEventos,
  nuevoListaEventos:nuevoListaEventos,



  // viejos
  lista: lista,
  nuevo: nuevo,
  getItem: getItem,
  actualizar: actualizar,
  eliminar: eliminar,
  authCookie: authCookie
};
