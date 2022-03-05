var gd = gd || {};

gd.juego = {
    spawn: function(nombre, params) {
        var entidad = new gd.template[nombre];

        entidad.id = gd.core.id.get();

        gd.core.storage.all.push(entidad);


        switch (entidad.type) {
            case 'a':
                gd.core.storage.a.push(entidad);
                break;
            case 'b':
                gd.core.storage.b.push(entidad);
                break;
            default:
                break;
        }

        if (arguments.length > 1 && entidad.iniciar){
            var args = [].slice.call(arguments, 1)
            entidad.iniciar.apply(entidad, args);
        } else if (entidad.iniciar) {
            entidad.iniciar();
        }
    },

    limites: function(obj, arriba, derecha, abajo, izquierda, offset) {
        if (offset === undefined)
            offset = 0;
        if (obj.x < -this.tamanio.width - offset) {
            return izquierda.call(obj);
        } else if (obj.x > this.tamanio.width + offset) {
            return derecha.call(obj);
        } else if (obj.y < -this.tamanio.height - offset) {
            return abajo.call(obj);
        } else if (obj.y > this.tamanio.height + offset) {
            return arriba.call(obj);
        }
    },

    rotar: function(obj) {
        var tiempoActual = Date.now();
        if (obj.lastUpdate < tiempoActual) {
            var delta = tiempoActual - obj.lastUpdate;

            obj.rotar.angulo += (30 * delta) / obj.rotar.speed;
        }
        obj.lastUpdate = tiempoActual;
    },

    aleatorio: {
        polaridad: function() {
            return Math.random() < 0.5 ? -1 : 1;   
         },
         numero: function(max, min) {
             return Math.floor(Math.random() * (max - min + 1) + min);
         }
    }
};