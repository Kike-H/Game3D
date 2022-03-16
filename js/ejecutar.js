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

    gd.template.Player = gd.template.Entity.extend({        
        // Golpe de choque a = amigable, b = enemigo
        type: 'a',
        
        // Generando info
        x: -1.4,
        
        // Informacion de Hitbox
        width: 1,
        height: 1,
        
        // Informacion de rotacion en los ejes x e y
        rotar: {
            angulo: 0,
            eje: [0, 0, 1],
            speed: 3
        },
        
        // Velocidad de viaje
        speed: 0.5,
        
        // Dice si el juegado tiene permitido disparar o no
        shoot: true,
        
        // Tiempo en milisegundos para retardar los disparos
        shootDelay: 400,

        iniciar: function() {            
            // Configurar la figura de triangulo
            this.figura([
                0.0,  2.0,  0.0, // arriba
               -1.0, -1.0,  0.0, // izquierda
                1.0, -1.0,  0.0  // derecha
            ]);

            // Configurar el color blanco
            this.color([
                // rojo, verde, azul, alpha ( transparencia)
                1.0, 1.0, 1.0, 1.0, // arriba
                1.0, 1.0, 1.0, 1.0, // izquierda
                1.0, 1.0, 1.0, 1.0  // derecha
            ]);
        },

        boundaryTop: function() { this.y = gd.juego.tamanio.height; },
        boundaryRight: function() { this.x = gd.juego.tamanio.width; },
        boundaryBottom: function() { this.y = -gd.juego.tamanio.height; },
        boundaryLeft: function () { this.x = -gd.juego.tamanio.width; },

        actualizar: function() {
            var self = this;
            
            // Mover izquiera o derecha para rotar el juegador
            if (Ctrl.left) {
                this.rotar.angulo += this.rotar.speed;
            } else if (Ctrl.right) {
                this.rotar.angulo -= this.rotar.speed;
            }

            if (Ctrl.up) {
                this.x -= Math.sin( this.rotar.angulo * Math.PI / 180 ) * this.speed;
                this.y += Math.cos( this.rotar.angulo * Math.PI / 180 ) * this.speed;
            } else if (Ctrl.down) {
                this.x += Math.sin( this.rotar.angulo * Math.PI / 180 ) * this.speed;
                this.y -= Math.cos( this.rotar.angulo * Math.PI / 180 ) * this.speed;
            }
            
            // Logica de limites de nivel
            gd.juego.limites(this, this.boundaryTop, this.boundaryRight, this.boundaryBottom, this.boundaryLeft);
            
            // Detectar un jugador disparando
            if (Ctrl.x && this.shoot) {                
                // Elementos generados necesitan tomar nuevos parametros
                gd.juego.spawn('Bullet', this.rotar.angulo, this.x, this.y);
                
                // Crear un temporizador para prevenir disparos
                this.shoot = false;
                window.setTimeout(function() {
                    self.shoot = true;
                }, this.shootDelay);
            }
        },

        matar: function() {
            this._super();

                        
            PolygonGen.clear();

            // Pantalla de fin de juego
            Hud.end();
        }
    });

    
    var Hud = {
        iniciar: function() {
            var self = this;
            
            // Configuracion de callback de inicio
            var callback = function() {
                if (Ctrl.x) {
                    // Quitar listener
                    window.removeEventListener('keydown', callback, true);
                    
                    // Crear generador de poligonos
                    PolygonGen.iniciar();
                    
                    // Ocultar texto
                    self.el.start.style.display = 'none';
                    self.el.title.style.display = 'none';
                }
            };

            // Agregar listener de clic de inicio
            window.addEventListener('keydown', callback, true);
        },

        end: function() {
            var self = this;
            
            // Mostrar texto de fin de juego
            this.el.end.style.display = 'block';
        },

        score: {
            count: 0,
            actualizar: function() {
                this.count++;
                
                // Texto de reemplazo de score
                Hud.el.score.innerHTML = this.count;
            }
        },
        
        // Almacena elementos
        el: {
            score: document.getElementById('count'),
            start: document.getElementById('start'),
            end: document.getElementById('end'),
            title: document.getElementById('title')
        }
    };
    
    // Creaar un cubo utilizando multiples vertices
    gd.template.Bullet = gd.template.Entity.extend({
        type: 'a',
        width: 0.6,
        height: 0.6,
        speed: 0.8,
        angulo: 0,

        iniciar: function(angulo, x, y) {            
            // Configurar triangulo con doble lado
            this.figura([
                // Cara Frontal
                0.0,  0.3,  0.0,
               -0.3, -0.3,  0.3,
                0.3, -0.3,  0.3
            ]);
            
            // Configurar color de bala 
            var pila = [];
            for (var line = this.shapeRows; line--;)
                pila.push(1.0, 0.0, 0.0, 1.0);
            this.color(pila);
            
            // Configurar angulo y ubicacion de parametros
            this.angulo = angulo;
            this.x = x;
            this.y = y;
        },

        actualizar: function() {            
            // Matar si el elemento va fuera del limite
            gd.juego.limites(this, this.matar, this.matar, this.matar, this.matar);
            
            // Movimiento
            this.x -= Math.sin( this.angulo * Math.PI / 180 ) * this.speed;
            this.y += Math.cos( this.angulo * Math.PI / 180 ) * this.speed;
        },

        chocar: function() {
            this._super();
            Hud.score.actualizar();
        }
    });

    var PolygonGen = {
        delay: 7000,
        limit: 9,

        iniciar: function() {
            var self = this;
            
            // Generar primer poligono
            this.count = 1;
            gd.juego.spawn('Polygon');
            
            // Configurar temporizador
            this.create = window.setInterval(function() {
                if (gd.core.storage.b.length < self.limit) {                    
                    // Incrementar contador
                    if (self.count < 3)
                        self.count++;

                    for (var c = self.count; c--;) {
                        gd.juego.spawn('Polygon');
                    }
                }
            }, self.delay);
        },

        clear: function() {            
            // Limpiar temporizadores
            window.clearInterval(this.create);            
            // Configurar velocidad de regreso al default
            this.count = 0;
            this.delay = 7000;
        }
    };

    gd.template.Polygon = gd.template.Entity.extend({
        type: 'b',
        width: 7,
        height: 9,

        iniciar: function() {
            this.figura([
                // Triangulo superior
                // Cara Frontal
                 0.0,  7.0,  0.0,
                -4.0,  2.0,  4.0,
                 4.0,  2.0,  4.0,
                // Cara derecha
                 0.0,  7.0,  0.0,
                 4.0,  2.0,  4.0,
                 4.0,  2.0, -4.0,
                // Cara trasera
                 0.0,  7.0,  0.0,
                 4.0,  2.0, -4.0,
                -4.0,  2.0, -4.0,
                // Cara izquierda
                 0.0,  7.0,  0.0,
                -4.0,  2.0, -4.0,
                -4.0,  2.0,  4.0,

                // Placas medias
                // Placa
                 -4.0, 2.0, 4.0,
                 -4.0, -5.0, 4.0,
                 -4.0, -5.0, -4.0,
                 -4.0, 2.0, 4.0,
                 -4.0, 2.0, -4.0,
                 -4.0, -5.0, -4.0,

                // Placa
                -4.0,  2.0, -4.0,
                -4.0, -5.0, -4.0,
                 4.0, -5.0, -4.0,
                -4.0,  2.0, -4.0,
                 4.0,  2.0, -4.0,
                 4.0, -5.0, -4.0,

                // Placa
                 4.0,  2.0,  4.0,
                 4.0,  2.0, -4.0,
                 4.0, -5.0, -4.0,
                 4.0,  2.0,  4.0,
                 4.0, -5.0,  4.0,
                 4.0, -5.0, -4.0,

                // Placa
                -4.0,  2.0,  4.0,
                 4.0,  2.0,  4.0,
                 4.0, -5.0,  4.0,
                -4.0,  2.0,  4.0,
                -4.0, -5.0,  4.0,
                 4.0, -5.0,  4.0,

                // Triangulo inferior
                // Cara frontal
                0.0, -10.0, 0.0,
                -4.0, -5.0,  4.0,
                 4.0, -5.0,  4.0,
                // Cara derecha
                 0.0, -10.0, 0.0,
                 4.0, -5.0,  4.0,
                 4.0, -5.0, -4.0,
                // Cara trasera
                 0.0, -10.0, 0.0,
                 4.0, -5.0, -4.0,
                -4.0, -5.0, -4.0,
                // Cara izquierda
                 0.0, -10.0, 0.0,
                -4.0, -5.0, -4.0,
                -4.0, -5.0,  4.0
            ]);

            this.randomSide();
            this.randomMeta();

            // Generar color de vertices            
            var pila = [];
            for (var v = 0; v < this.shapeRows * this.shapeColumns; v += 3) {
                // Colorear Triangulo
                if (v > 108 || v <= 36) {
                    pila.push(this.colorData.pyramid[0], this.colorData.pyramid[1], this.colorData.pyramid[2], 1);

                // Colorear cuadrado
                } else {
                    pila.push(this.colorData.cube[0], this.colorData.cube[1], this.colorData.cube[2], 1);
                }
            }
            this.color(pila);
        },
        
        // Aleatoriamente genera meta informacion  como velocidad, rotacion y otros detalles aleatorios.
        randomMeta: function() {
            this.rotar = {
                speed: gd.juego.aleatorio.numero(400, 100),
                eje: [
                    gd.juego.aleatorio.numero(10, 1) / 10,
                    gd.juego.aleatorio.numero(10, 1) / 10,
                    gd.juego.aleatorio.numero(10, 1) / 10
                ],
                angulo: gd.juego.aleatorio.numero(250, 1)
            };
            
            // Generar velocidad aleatoriamente
            this.speed = {
                x: gd.juego.aleatorio.numero(10, 4) / 100,
                y: gd.juego.aleatorio.numero(10, 4) / 100
            };
            
            // Elige 3 colores aleatorios
            this.colorData = {
                pyramid: [
                    gd.juego.aleatorio.numero(10, 1) / 10,
                    gd.juego.aleatorio.numero(10, 1) / 10,
                    gd.juego.aleatorio.numero(10, 1) / 10
                ],
                cube: [
                    gd.juego.aleatorio.numero(10, 1) / 10,
                    gd.juego.aleatorio.numero(10, 1) / 10,
                    gd.juego.aleatorio.numero(10, 1) / 10
                ]
            };
        },
        
        // Determina un lado del area de juego de donde generar
        randomSide: function() {            
            // Aleatoriamente generar de uno de los cuatro lados
            var lado = gd.juego.aleatorio.numero(4, 1);

            // superior
            if (lado === 1) {
                this.angulo = gd.juego.aleatorio.numero(200, 160);
                var range = gd.juego.tamanio.width - this.width;
                this.x = gd.juego.aleatorio.numero(range, -range);
                this.y = gd.juego.tamanio.height + this.height;

            // derecho
            } else if (lado === 2) {
                this.angulo = gd.juego.aleatorio.numero(290, 250);
                var range = gd.juego.tamanio.height - this.height;
                this.x = (gd.juego.tamanio.width + this.width) * -1;
                this.y = gd.juego.aleatorio.numero(range, -range);

            // inferior
            } else if (lado === 3) {
                this.angulo = gd.juego.aleatorio.numero(380, 340);
                var range = gd.juego.tamanio.width - this.width;
                this.x = gd.juego.aleatorio.numero(range, -range);
                this.y = (this.height + gd.juego.tamanio.height) * -1;

            // izquierda
            } else {
                this.angulo = gd.juego.aleatorio.numero(110, 70);
                var range = gd.juego.tamanio.height - this.height;
                this.x = gd.juego.tamanio.width + this.width;
                this.y = gd.juego.aleatorio.numero(range, -range);
            }
        },

        actualizar: function() {
            gd.juego.limites(this, this.matar, this.matar, this.matar, this.matar, (this.width * 2));
            
            // Logica para aceleracion
            this.x -= Math.sin( this.angulo * Math.PI / 180 ) * this.speed.x;
            this.y += Math.cos( this.angulo * Math.PI / 180 ) * this.speed.y;

            gd.juego.rotar(this);
        },

        chocar: function() {             
            // Generar un numero de particulas generadas en el centro actual
            // pero solamente si el juego tiene suficiente memoria para soportar
            if (gd.core.storage.all.length < 50) {
                for (var p = 15; p--;) {
                    gd.juego.spawn('Particle', this.x, this.y);
                }
            }
            
            // Generar un numero aleatorio de cubos generados en el centro actual
            var num = gd.juego.aleatorio.numero(2, 4);
            for (var c = num; c--;) {
                gd.juego.spawn('Cube', this.x, this.y);
            }

            this.matar();
        }
    });

    gd.template.Cube = gd.template.Entity.extend({
        type: 'b',
        tamanio: {
            max: 3,
            min: 2,
            divider: 1
        },
        pressure: 50,

        meta: function() {            
            // Aceleracion aleatoria x e y
            this.speed = {
                x: (gd.juego.aleatorio.numero(this.pressure, 1) / 100) * gd.juego.aleatorio.polaridad(),
                y: (gd.juego.aleatorio.numero(this.pressure, 1) / 100) * gd.juego.aleatorio.polaridad()
            };
            
            // Direccion aleatoria
            this.angulo = gd.juego.aleatorio.numero(360, 1);
            
            // Tamaño aleatorio
            this.s = gd.juego.aleatorio.numero(this.tamanio.max, this.tamanio.min) / this.tamanio.divider;
            this.width = this.s * 2;
            this.height = this.s * 2;
        },

        iniciar: function(x, y) {
            this.x = x;
            this.y = y;

            this.meta();

            this.figura([
                // Frontal
                -this.s, -this.s,  this.s,
                 this.s, -this.s,  this.s,
                 this.s,  this.s,  this.s,
                -this.s,  this.s,  this.s,
                // Trasera
                -this.s, -this.s, -this.s,
                -this.s,  this.s, -this.s,
                 this.s,  this.s, -this.s,
                 this.s, -this.s, -this.s,
                // Superior
                -this.s,  this.s, -this.s,
                -this.s,  this.s,  this.s,
                 this.s,  this.s,  this.s,
                 this.s,  this.s, -this.s,
                // Inferior
                -this.s, -this.s, -this.s,
                 this.s, -this.s, -this.s,
                 this.s, -this.s,  this.s,
                -this.s, -this.s,  this.s,
                // Derecha
                 this.s, -this.s, -this.s,
                 this.s,  this.s, -this.s,
                 this.s,  this.s,  this.s,
                 this.s, -this.s,  this.s,
                // Izquierda
                -this.s, -this.s, -this.s,
                -this.s, -this.s,  this.s,
                -this.s,  this.s,  this.s,
                -this.s,  this.s, -this.s
            ]);

            this.indices([
                 0,  1,  2,    0,  2,  3, // frontal
                 4,  5,  6,    4,  6,  7, // trasera
                 8,  9, 10,    8, 10, 11, // superior
                12, 13, 14,   12, 14, 15, // inferior
                16, 17, 18,   16, 18, 19, // derecha
                20, 21, 22,   20, 22, 23  // izquierda
            ]);

            this.color([
                [1, 0, 0, 1], // frontal: rojo
                [0, 1, 0, 1], // trasera: verde
                [0, 0, 1, 1], // superior: azul
                [1, 1, 0, 1], // inferior: azul
                [1, 0, 1, 1], // Cara derehca face: amarillo
                [0, 1, 1, 1]  // Cara izquierda: purpura
            ]);

            if (this.rotar) {
                this.rotar = {
                    eje: [
                        gd.juego.aleatorio.numero(10, 1) / 10,
                        gd.juego.aleatorio.numero(10, 1) / 10,
                        gd.juego.aleatorio.numero(10, 1) / 10],
                    angulo: gd.juego.aleatorio.numero(350, 1),
                    speed: gd.juego.aleatorio.numero(400, 200)
                };
            }
        },

        
        // Ocurre en cada actulizacion de frame        
        // Iniciar : function () {} puede tambien llamarse para alterar un objeto justo cuando es creado
        actualizar: function() {
            var self = this;
            gd.juego.limites(self, this.matar, this.matar, this.matar, this.matar, this.width);
            
            // logica para aceleracion
            this.x -= Math.sin( this.angulo * Math.PI / 180 ) * this.speed.x;
            this.y += Math.cos( this.angulo * Math.PI / 180 ) * this.speed.y;
            
            // Utiliza una metrica de tiempo para actualizar y configura su rotacion            
            // Orginnalmente del tutorial WebGL de Mozilla https://developer.mozilla.org/en/WebGL/Animating_objects_with_WebGL
            if (this.rotar)
                gd.juego.rotar(this);
        }
    });

    gd.template.Particle = gd.template.Cube.extend({
        pressure: 20,
        type: 0,
        tamanio: {
            min: 2,
            max: 6,
            divider: 10
        },

        iniciar: function(x, y) {
            this.x = x;
            this.y = y;

            this.meta();
            
            // Configurar una figura de rectangulo plana
            this.figura([
                 this.s,  this.s,  0.0,
                -this.s,  this.s,  0.0,
                 this.s, -this.s,  0.0,
                -this.s, -this.s,  0.0
            ]);
            
            // Configurar color aleatorio
            var r = gd.juego.aleatorio.numero(10, 0) / 10,
            g = gd.juego.aleatorio.numero(10, 0) / 10,
            b = gd.juego.aleatorio.numero(10, 0) / 10;
            this.color([
                r, g, b, 1,
                r, g, b, 1,
                r, g, b, 1,
                r, g, b, 1
            ]);

            var self = this;
            this.create = window.setTimeout(function() {
                self.matar();
            }, 5000);
        }
    });
}());