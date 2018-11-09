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
  db.one(`SELECT  id, usuario, id_persona, id_perfil, id_empresa
          FROM    usuarios 
          WHERE   usuario like $1
          AND   password like $2 
          AND   estado = 3;`,
    // parametros para la query
    [req.body.usuario, req.body.password])
    .then(function (data) {
      // //cookie idusuario

      req.session.idusuario = data.id;
      req.session.idperfil = data.id_perfil;
      req.session.idempresa = data.id_empresa;
      
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

      db.any(`SELECT 	a.id, a.nombre
              FROM  	calendarios a, usuarios b
              WHERE 	b.id = $1
              and   	a.id_empresa = b.id_empresa
              and    	a.id_empresa = $2;`,
        [req.session.idusuario, req.session.idempresa])
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
      let usuario = parseInt(req.params.id_usuario_colab)
      

      // verificar perfil
      let query=``;
      if(req.session.idperfil==1)
      { //sup
        query = `SELECT  a.id as id,
                  to_char(a.fecha_inicio,'YYYY-MM-DD HH24:MM') as fecha, 
                  concat (p.nombre, ' ', p.apellido, ' | ', u.nombre) as nombre
                FROM    eventos a, ubicaciones u, usuarios us, personas p
                WHERE   
                  a.id_usuario_colab = $1 and
                  to_char(a.fecha_inicio,'YYYY-MM-DD')= to_char(now(), 'YYYY-MM-DD') and
                  a.id_calendario= $2 and
                  a.id_ubicacion = u.id and
                  a.id_usuario_colab = us.id and
                  us.id_persona = p.id and
                  a.id_empresa = $3;
                `;
      } else 
      { //miembro
        query =`SELECT  a.id as id,
                        to_char(a.fecha_inicio,'YYYY-MM-DD HH24:MM') as fecha, 
                        concat (a.nombre, ' | ', u.nombre ) as Turno
                FROM    eventos a, ubicaciones u, usuarios us, personas p
                WHERE   
                        a.id_usuario_colab = $1 and
                        to_char(a.fecha_inicio,'YYYY-MM-DD')= to_char(now(), 'YYYY-MM-DD') and
                        a.id_calendario= $2 and
                        a.id_ubicacion = u.id and
                        a.id_usuario_colab = us.id and
                        us.id_persona = p.id and
                        a.id_empresa = $3;
                `;
      }
      // consultar bd
      db.any(query,
        [usuario, calendario, req.session.idempresa])
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
    let usuario_colab = parseInt(req.params.id_usuario_colab)

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
        query = `SELECT 	a.id, 
                          a.id_calendario, 
                          concat(p.nombre, ' ', p.apellido, ' | ', u.nombre) as nombre,
                          to_char(a.fecha_inicio,'YYYY-MM-DD HH24:MM') as fecha
                FROM 	eventos a, ubicaciones u, usuarios us,personas p
                WHERE 	a.id_usuario_colab =$1 and
                          to_char(a.fecha_inicio,'YYYY-MM-DD') = $2 and 
                          a.id_calendario= $3 and
                          a.id_ubicacion = u.id and
                          a.id_usuario_colab = us.id and
                          us.id_persona = p.id and
                          a.id_empresa = $4;`
      } else 
      { //miembro
        query =`SELECT  a.id, 
                        a.id_calendario, 
                        concat (a.nombre, ' | ', u.nombre ) as Turno,
                        to_char(a.fecha_inicio,'YYYY-MM-DD HH24:MM') as fecha
                FROM 	  eventos a, ubicaciones u, usuarios us,personas p
                WHERE 	a.id_usuario_colab = $1 and
                        to_char(a.fecha_inicio,'YYYY-MM-DD') = $2 and 
                        a.id_calendario= $3 and
                        a.id_ubicacion = u.id and
                        a.id_usuario_colab = us.id and
                        us.id_persona = p.id and
                        a.id_empresa = $4;`
      }
      
      // consultar bd
      db.any(query,
        [usuario_colab, fecha, calendario,req.session.idempresa])
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
                      to_char(e.fecha_fin, 'YYYY-MM-DD HH24:MM') as Fin, e.id_empresa,
                      e.tiempo_alerta as Alerta, e.repetir as Repetir, e.color as Color, e.margen_entrada as Entrada, e.margen_salida as Salida 
              FROM  	eventos e, ubicaciones u
              WHERE   e.id_ubicacion = u.id AND e.id= $1 AND e.id_usuario_colab = $2 AND e.estado = 3
              AND     e.id_empresa = u.id_empresa
              AND     e.id_empresa = $3
      	    ;`,
        [evento, usuario_colab, req.session.idempresa])
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

//select de nuevo que trae nombre de calendario, usuarios_colaboradores y tiempo_alerta
function  calendariosListaNuevoDetalles(req, res, next) {
  try{

    if(req.session.idusuario){
      // preparar parametros
      
      //consultar bd
      
       // verificar perfil
       let query=``;
       if(parseInt(req.session.idperfil)==1)
       { //sup
        
        
         query = `
                  SELECT 	distinct (c.id), (c.nombre),
                          concat 	 (pc.nombre, ' ', pc.apellido),
                          em.tiempo_alerta
                  FROM 	  calendarios as c, personas as p, relaciones as r, equipos as e, 
                          usuarios us, usuarios uc, personas pc, empresas em
                  WHERE 	r.id_usuario_sup = $1
                  and	    c.id_equipo = e.id
                  and	    e.id = r.id_equipo
                  and	    r.id_usuario_sup = us.id
                  and	    r.id_usuario_colab = uc.id
                  and 	  r.id_equipo = e.id
                  and	    uc.id_persona = pc.id
                  and	    c.id_empresa = e.id_empresa
                  and	    us.id_empresa = p.id_empresa
                  and	    uc.id_empresa = pc.id_empresa
                  and 	  r.id_empresa = e.id_empresa
                  and	    r.id_empresa = $2
                `;

       }  else 
       {
        res.status(403)
        .json({
          estado: false,
          data: "no posee permiso"
       });
      }
      db.any(query, 
        [req.session.idusuario, req.session.idempresa])
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
    // let equipo = parseInt(req.params.id_equipo);

    if(req.session.idusuario && req.session.idperfil == 1){
      // preparar parametros
      
      //consultar bd

      db.none(`INSERT INTO  eventos(fecha_inicio, repetir, 
                              margen_entrada, margen_salida, id_ubicacion,fecha_fin, id_empresa)
                     VALUES ($1,$2,$3,$4,$5,$6,$7);` , 
        [req.body.fecha_inicio, req.body.repetir,  
          req.body.margen_entrada, req.body.margen_salida, req.body.id_ubicacion, req.body.fecha_fin, 
          req.session.iempresa])
        .then(function () {
          res.status(200)
            .json({
              estado: true,
            });
        })
        .catch(function (err) {
          return next(err);
        });
    }
     else {
      res.status(404)
      .json({
        estado: false
      });
    }
  } catch(err){}
}


function configuracionUsuarioPerfilUsuario(req, res, next) {
  try{
    let usuario = parseInt(req.params.id);
    if(req.session.idusuario){
      // preparar parametros
      
      // consultar bd
      
      
      db.any(`SELECT 	p.nombre, p.apellido, p.dni, p.fecha_nac, p.sexo, p.cargo, c.nombre as categoria
              FROM  	personas as p, usuarios as u, categorias as c
              WHERE 	p.id= u.id_persona AND c.id = u.id_categoria
              AND   	u.id = $1
              AND	    u.id_empresa = p.id_empresa
              AND   	u.id_empresa = c.id_empresa
              AND 	  p.id_empresa = $2;`,
        [usuario, req.session.idempresa])
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

function configuracionUsuarioPerfilEmpresa(req, res, next) {
  try{

    if(req.session.idusuario){
      // preparar parametros
      
      // consultar bd
      db.any(`select id, nombre
              from empresas
              where id = $1;`,
        [req.session.idempresa])
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


function configuracionUsuarioPerfilUsuarioAnhadir(req, res, next) {
  try{
    if(req.session.idusuario && req.session.idperfil == 1){
      // preparar parametros
      
      // consultar bd
      db.any(`INSERT 	INTO relaciones( 
                                       id_usuario_sup, 
                                       id_usuario_colab, 
                                       id_equipo, 
                                       id_empresa
                                      )
            VALUES 		                ( 
                                        $1,
                                        $2,
                                        $3,
                                        $4
                                      );`,
        [req.session.idusuario, req.body.id_usuario_colab, req.body.id_equipo, 
        req.session.idempresa])
        .then(function (data) {
          // console.log(data);
          res.status(200)
            .json({
              estado:true
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

function configuracionUsuarioPerfilUsuarioPromover(req, res, next) {
  try{
      let usuario = parseInt(req.params.id)

    if(req.session.idusuario && req.session.idperfil == 1){
      // preparar parametros
            // consultar bd
      db.any(`UPDATE usuarios
              SET id_perfil=1
              WHERE id=$2 and id_empresa = $3;`,
        [req.body.id_perfil, usuario, req.session.idempresa])
        .then(function (data) {
          // console.log(data);
          res.status(200)
            .json({
              estado:true
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

function configuracionUsuarioPerfilUsuarioEliminar(req, res, next) {
  try{
      let usuario = parseInt(req.params.id)

    if(req.session.idusuario ){
      // preparar parametros
            // consultar bd
      db.any(`DELETE FROM relaciones
              WHERE id=$1 and id_empresa=$2;`,
        [usuario, req.session.idempresa])
        .then(function (data) {
          // console.log(data);
          res.status(200)
            .json({
              estado:true
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

function configuracionCalendarioTiempoAlerta(req, res, next) {
  try{

    if(req.session.idusuario && req.session.idperfil == 1){
      // preparar parametros
            // consultar bd
      db.any(`SELECT  tiempo_alerta
              FROM empresas
              where id = $1;`,
        [req.session.idempresa])
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

function configuracionCalendarioActualizarTiempo(req, res, next) {
  try{

    if(req.session.idusuario  && req.session.idperfil == 1){
      // preparar parametros
            // consultar bd
      db.any(`UPDATE empresas
              SET tiempo_alerta=$1
              WHERE id=$2;`,
        [req.body.tiempo_alerta , req.session.idempresa])
        .then(function (data) {
          // console.log(data);
          res.status(200)
            .json({
              estado:true
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


function configuracionCalendarioNuevo(req, res, next) {
  try{

    if(req.session.idusuario && req.session.idperfil == 1){
      // preparar parametros
            // consultar bd
      db.any(`INSERT INTO calendarios(nombre, id_empresa)
              VALUES 		($1,$2);`,
        [req.body.nombre , req.session.idempresa])
        .then(function (data) {
          // console.log(data);
          res.status(200)
            .json({
              estado:true
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





// nuevos rod

function inicioAgendaAhora(req, res, next) {
  try{
    if(req.session.idusuario){
      // preparar parametros
      
      // consultar bd
      db.any(`select e.id as id, 
                e.id_usuario_colab, 
                to_char(e.fecha_inicio, 'YYYY-MM-DD HH24:MM') as fecha, 
                to_char(e.fecha_inicio, 'DD') as dia, 
                to_char(e.fecha_inicio, 'MM') as mes, 
                to_char(e.fecha_inicio, 'HH24:MI') as hora_inicio, 
                to_char(e.fecha_fin, 'HH24:MI') as hora_fin, 
                concat(e.nombre, ' | ' , u.nombre) as descripcion 
              from eventos as e 
                left join ubicaciones as u on e.id_ubicacion = u.id 
              where to_char(e.fecha_inicio, 'YYYY-MM-DD') = to_char(now(), 'YYYY-MM-DD') and 
                to_char(now(), 'HH24:MI') >= to_char(e.fecha_inicio, 'HH24:MI') and 
                to_char(now(), 'HH24:MI') <= to_char(e.fecha_fin, 'HH24:MI') and 
                id_usuario_colab = $1 -- filtrar por mi id de usuario 
              limit 1;`,
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

function inicioAgendaManana(req, res, next) {
  try{
    if(req.session.idusuario){
      // preparar parametros
      
      // consultar bd
      db.any(`select e.id as id, 
                e.id_usuario_colab,
                to_char(e.fecha_inicio, 'YYYY-MM-DD HH24:MM') as fecha, 
                to_char(e.fecha_inicio, 'DD') as dia,
                to_char(e.fecha_inicio, 'MM') as mes,
                to_char(e.fecha_inicio, 'HH24:MI') as hora_inicio,
                to_char(e.fecha_fin, 'HH24:MI') as hora_fin,
                concat(e.nombre, ' | ' , u.nombre) as descripcion
              from eventos as e 
                left join ubicaciones as u on e.id_ubicacion = u.id
              where to_char(e.fecha_inicio, 'YYYY-MM-DD') = to_char(now() + interval '1 days', 'YYYY-MM-DD') and
                id_usuario_colab = $1 -- filtrar por mi id de usuario
              order by fecha asc
              limit 1;`,
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

function inicioSolicitudes(req, res, next) {
  try{
    if(req.session.idusuario){
      // preparar parametros
      
      // consultar bd
      db.any(`(
              select s.id as id, 
                s.id_usuario_colab,
                to_char(e.fecha_inicio, 'YYYY-MM-DD HH24:MM') as fecha,
                to_char(e.fecha_inicio, 'DD') as dia,
                to_char(e.fecha_inicio, 'MM') as mes,
                to_char(e.fecha_inicio, 'HH24:MI') as hora_inicio,
                to_char(e.fecha_fin, 'HH24:MI') as hora_fin,
                concat(st.nombre,' | ' , p.nombre, ' ', p.apellido) as descripcion 
              from solicitudes as s 
                left join solicitudes_tipos as st on s.id_tipo = st.id 
                left join eventos as e on s.id_evento_colab = e.id 
                left join usuarios as u on s.id_usuario_colab_cambio = u.id 
                left join personas as p on u.id_persona = p.id 
              where s.id_tipo = 2 and -- cambio de turno
                s.id_usuario_colab = $1 -- mias
              order by fecha asc 
              limit 1
              )
              union all
              (
              -- ultima ausencia
              select s.id as id, 
                s.id_usuario_colab,
                to_char(e.fecha_inicio, 'YYYY-MM-DD HH24:MM') as fecha,
                to_char(e.fecha_inicio, 'DD') as dia,
                to_char(e.fecha_inicio, 'MM') as mes,
                to_char(e.fecha_inicio, 'HH24:MI') as hora_inicio,
                to_char(e.fecha_fin, 'HH24:MI') as hora_fin,
                concat(st.nombre,' | ' , m.nombre) as descripcion
              from solicitudes as s 
                left join solicitudes_tipos as st on s.id_tipo = st.id 
                left join eventos as e on s.id_evento_colab = e.id 
                left join motivos as m on s.id_motivo = m.id 
              where s.id_tipo = 1 and -- ausencias 
                s.id_usuario_colab = $1 -- mias
              order by fecha asc 
              limit 1
              )`,
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
  // nuevos pao
  calendarioListaCalendario:calendarioListaCalendario,
  calendarioListaEventosHoy:calendarioListaEventosHoy,
  calendarioListaEventos:calendarioListaEventos,
  calendarioListaVerTurno:calendarioListaVerTurno,
  calendariosListaNuevoDetalles:calendariosListaNuevoDetalles,
  calendarioListaNuevoDetallesOtros:calendarioListaNuevoDetallesOtros,
  configuracionUsuarioPerfilUsuario:configuracionUsuarioPerfilUsuario,
  configuracionUsuarioPerfilEmpresa:configuracionUsuarioPerfilEmpresa,
  configuracionUsuarioPerfilUsuarioAnhadir,configuracionUsuarioPerfilUsuarioAnhadir,
  configuracionUsuarioPerfilUsuarioPromover:configuracionUsuarioPerfilUsuarioPromover,
  configuracionUsuarioPerfilUsuarioEliminar:configuracionUsuarioPerfilUsuarioEliminar,
  configuracionCalendarioTiempoAlerta:configuracionCalendarioTiempoAlerta,
  configuracionCalendarioActualizarTiempo:configuracionCalendarioActualizarTiempo,
  configuracionCalendarioNuevo:configuracionCalendarioNuevo,



  // nuevos rod
  inicioAgendaAhora:inicioAgendaAhora,
  inicioAgendaManana:inicioAgendaManana,
  inicioSolicitudes:inicioSolicitudes,


  // viejos
  lista: lista,
  nuevo: nuevo,
  getItem: getItem,
  actualizar: actualizar,
  eliminar: eliminar,
  authCookie: authCookie
};
