(function() {
    gd.core.iniciar(800, 600, function() {
        Ctrl.iniciar();
        Hud.iniciar();
        gd.juego.spawn('Player');
    });

    // informacion de las ccordenadas x e y para el espacio 3D
    gd.juego.tamanio = {
        width: 43,
        height: 32
    };

    var Ctrl = {
        iniciar: function() {
            window.addEventListener('keydown', this.keyDown, true);
            window.addEventListener('keyup', this.keyUp, true);
        },

        keyDown: function(event) {
            switch(event.keyCode) {
                case 38: // arriba
                    Ctrl.up = true;
                    break;
                case 40: // abajo
                    Ctrl.down = true;
                    break;
                case 37: // izquierda
                    Ctrl.left = true;
                    break;
                case 39: // Derecha
                    Ctrl.right = true;
                    break;
                case 88:
                    Ctrl.x = true;
                    break;
                default:
                    break;
            }
        },

        keyUp: function(event) {
            switch(event.keyCode) {
                case 38:
                    Ctrl.up = false;
                    break;
                case 40:
                    Ctrl.down = false;
                    break;
                case 37: // Izquierda
                    Ctrl.left = false;
                    break;
                case 39: // Derecha
                    Ctrl.right = false;
                    break;
                case 88:
                    Ctrl.x = false;
                    break;
                default:
                    break;
            }
        }
    };

    var Hud = {
        int: function(){
            var self = this;

            var callback = function(){
                if(ctrl.x){
                    window.removeEventListener('keydown', callback, true);
                    PolygonGen.init();
                    slef.el.inicio.style.display = 'none';
                    slef.el.titulo.style.display = 'none';
                }
            }
        },
        fin: function(){
            var selft = this;
            this.el.fin.style.style.display = 'block';
        },
        marcador: {
            contador: 0,
            update: function(){
                this.contador++;
                Hud.el.marcador.innerHTML = this.contador;
            }
        },
        el: {
            marcador: document.getElementById('contador'),
            inicio: document.getElementById('inicio'),
            fin: document.getElementById('fin'),
            titulo: document.getElementById('titulo')
        }
    };

    gd.template.Jugador = gd.template.Entity.extend({
        type: 'a',
        x: -1.4,
        width: 1,
        height: 1,
        speed: 0.5,
        dispara: true,
        retrasoDisparo: 400,
        rotate: {
            angulo: 0,
            ejes: [0,0,1],
            speed: 3
        },
        init: function() {
            this.figura([
                0.0, 
                2.0,
                -1.0,
                -1.0,
                0.0,
                1.0,
                -1.0,
                0.0
            ]);
            this.color([
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
            ]);            
        },
        limiteSuperior: function() {this.y = gd.juego.tamanio.height;},
        limiteDerecho: function() {this.x = gd.juego.tamanio.width;},
        limiteInferior: function() {this.y = -gd.juego.tamanio.height;},
        limiteIzquierdo: function() {this.x = -gd.juego.tamanio.width;},
        matar: function() {
            this._super();
            PolygonGen.clear();
            Hud.fin();
        },
        actualizar: function() {
            var selft = this;
            if(Ctrl.left){
                this.rotate.angulo += this.rotate.speed;
            }
            else if (Ctrl.right) {
                this.x -= this.rotate.speed;
            }
            else if (Ctrl.up) {
                this.x -= Math.sin(this.rotate.angulo * Math.PI / 180)*this.speed;
                this.y += Math.cos(this.rotate.angulo * Math.PI / 180)*this.speed;
            }
            else if (Ctrl.down) {
                this.x += Math.sin(this.rotate.angulo * Math.PI / 180)*this.speed;
                this.y -= Math.cos(this.rotate.angulo * Math.PI / 180)*this.speed;
            }
            gd.juego.fronteras(this, this.limiteSuperior, this.limiteDerecho, this.limiteInferior, this.limiteIzquierdo);

            if(Ctrl.x && this.dispara) {
                gd.juego.engendrar('Bala', this.rotate.angulo, this.x, this.y);
                this.dispara = false;
                window.setTimeout(function() {
                    selft.dispara = true;
                }, this.retrasoDisparo)
            }

        }
    });

    gd.template.Bala = gd.template.Entity.extend({
        type: 'a',
        width: 0.6,
        height: 0.6,
        speed: 0.8, 
        angulo: 0,
        init: function(angulo, x, y,) {
            this.figura([
                0.0, 0.3, 0.0, 
                -0.3, -0.3, -0.3, 
                0.3, -0.3, 0.3, 
            ]);
            var pila = [];
            for(var linea = this.shapeRows; linea--;){
                pila.push(1.0, 0.0, 0.0, 1.0);
            }
            this.color(pila);
            this.angulo;
            this.x = x;
            this.y = y;
        },
        actualizar: function() {
            gd.juego.fronteras(this, this.matar, this.matar, this.matar, this.matar);
            this.x -= Math.sin(this.angulo * Math.PI / 180) * this.speed; 
            this.y += Math.cos(this.angulo * Math.PI / 180) * this.speed; 
        },
        colision: function() {
            this._super();
            Hud.marcador.actualizar();
        }
    });
    gd.template.Poligono = gd.template.Entity.extend({
        type: 'b',
        width: 7, 
        height: 9, 

        init: function() {
            this.ladoAleatorio();
            this.metaAleatorio();

            var pila = [];

            for(var v = 0; v < this.shapeRows*this.shapeColumns; v+=3) {
                if(v > 180 || v <= 36) {
                    pila.push(this.colorData.piramide[0], this.colorData.piramide[1], this.colorData.cubo[2], 1)
                } else {
                    pila.push(this.colorData.cubo[0], this.colorData.cubo[1], this.colorData.cubo[2], 1)
                }
            }
            this.color(pila);
        }
    })



}());
