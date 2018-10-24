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

    //validar parametros
    //verificar si son numeros
    let dia = parseInt(req.params.dia);
    let mes = parseInt(req.params.mes);
    let anho = parseInt(req.params.anho);
    let calendario = parseInt(req.params.id_calendario);

    if(req.session.idusuario && mes >=1 && mes<=12 && anho>0 && dia>=1){
      
      // preparar parametros     
          
      if(mes<10){
        mes = '0'+mes;
      }      
      if(dia<10){
        dia = '0'+dia;
      }
    
      const fecha = anho + '-' + mes + '-' + dia;
    
      
      
      // verificar perfil
      let query=``;
    
      if(parseInt(req.session.idperfil)==1)
      { //sup
        query = `SELECT a.id, 
                        a.id_calendario, 
                        concat(p.nombre, ' ', p.apellido, ' | ', u.nombre) as nombre,
                        to_char(a.fecha_inicio,'YYYY-MM-DD HH24:MM') as fecha
                 FROM eventos a, ubicaciones u, personas p
                 WHERE a.id_ubicacion = u.id and   
                      a.id_usuario_colab =$1 and
                      to_char(a.fecha_inicio,'YYYY-MM-DD') = $2 and 
                      a.id_calendario=$3;`
      } else 
      { //miembro
        query =`SELECT a.id, 
                      a.id_calendario, 
                      concat (a.nombre, ' | ', u.nombre ) as Turno,
                      to_char(a.fecha_inicio,'YYYY-MM-DD HH24:MM') as fecha
                FROM eventos a, ubicaciones u, personas p
                WHERE a.id_ubicacion = u.id and   
                      a.id_usuario_colab =$1 and
                      to_char(a.fecha_inicio,'YYYY-MM-DD') = $2 and 
                      a.id_calendario=$3;`
      }
     
      
      // consultar bd
      db.any(query,
        [req.session.idusuario, fecha, calendario])
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


function calendarioListaVerTurno (req, res, next) {
  try{
    
    let evento = parseInt(req.params.id);
    let usuario_colab = parseInt(req.params.id_usuario_colab);
    
    
    if(req.session.idusuario){
      // preparar parametros
  
      
      //consultar bd
      
       // verificar perfil
       
      db.any(`SELECT 	e.id as Id, e.nombre as Titulo, u.nombre as Ubicacion,
                      to_char (e.fecha_inicio, 'YYYY-MM-DD HH24:MM') as Inicio, 
                      to_char(e.fecha_fin, 'YYYY-MM-DD HH24:MM') as Fin, 
                      e.tiempo_alerta as Alerta, e.repetir as Repetir, e.color as Color, e.margen_entrada as Entrada, e.margen_salida as Salida 
              FROM 	eventos e, ubicaciones u
              WHERE  e.id_ubicacion = u.id AND e.id= 5 AND e.id_usuario_colab = 5 AND e.estado = 3
      	    ;`,
        [req.session.idusuario, evento, usuario_colab])
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

//selectque trae nombre de calendario y usuarios_colaboradores
function  calendariosListaNuevoDetalles(req, res, next) {
  try{

    let usuario_sup = parseInt(req.params.id_usuario_sup);
    if(req.session.idusuario){
      // preparar parametros
      
      //consultar bd
      
       // verificar perfil
       let query=``;
       if(parseInt(req.session.idperfil)==1)
       { //sup
        
        
         query = `
                  SELECT 	distinct (c.id), (c.nombre),
                          concat 	 (pc.nombre, ' ', pc.apellido)
                  FROM 		calendarios as c, personas as p, relaciones as r, equipos as e, 
                          usuarios us, usuarios uc, personas pc
                  WHERE 	r.id_usuario_sup = $1
                          and	c.id_equipo = e.id
                          and	e.id = r.id_equipo
                          and	r.id_usuario_sup = us.id
                          and	r.id_usuario_colab = uc.id
                          and 	r.id_equipo = e.id
                          and	uc.id_persona = pc.id
                `;

                console.log("prueba");
       }  else 
       {
        res.status(403)
        .json({
          estado: false,
          data: "no posee permiso"
       });
      }
      db.any(query, 
        [req.session.idusuario, usuario_sup])
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

//insert de nuevo
function calendarioListaNuevoDetallesOtros(req, res, next) {
  try{
    let equipo = parseInt(req.params.id_equipo);

    if(req.session.idusuario){
      // preparar parametros
      
      //consultar bd
      
       // verificar perfil
       let query=``;
       if(req.session.idperfil==1)
       { //sup
         query = `INSERT INTO  eventos(fecha_inicio, repetir, tiempo_alerta, color, 
                               margen_entrada, margen_salida, id_ubicacion,fecha_fin)
                  VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
                `;
       }  else 
       {
        res.status(403)
        .json({
          estado: false,
          data: "no posee permiso"
       });
      }
      db.none(query, 
        [ req.body.fecha_inicio, req.body.repetir, req.body.tiempo_alerta, req.body.color, 
          req.body.margen_entrada, req.body.margen_salida, req.body.id_ubicacion, req.body.fecha_fin, 
          req.session.idusuario])
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
  calendarioListaVerTurno:calendarioListaVerTurno,
  calendariosListaNuevoDetalles:calendariosListaNuevoDetalles,
  calendarioListaNuevoDetallesOtros:calendarioListaNuevoDetallesOtros,



  // viejos
  lista: lista,
  nuevo: nuevo,
  getItem: getItem,
  actualizar: actualizar,
  eliminar: eliminar,
  authCookie: authCookie
};
