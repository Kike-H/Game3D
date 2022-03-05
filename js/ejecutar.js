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

}());
