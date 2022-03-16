var gd = gd || {};

gd.core = {
    canvas: document.getElementById("canvas"),
    tamanio: function(width, height){
        this.horizAspect = width / height;

    },
    
    id: {
        count : 0, // Correccion contador: 0,
        get: function()
        {
            return this.count++; // Correccion return this.contador;
        }
    },

    storage: 
    {
        all: [],
        a: [],
        b: []
    },
    
    iniciar: function(width, height, ejecutar)
    {
        this.tamanio(width, height);
        if(!this.canvas.getContext) return alert('Por favor descargue un navegador que soporte Canvas como google Chrome.');
        gd.gl = this.canvas.getContext("experimental-webgl");
        if(gd.gl === null || gd.gl === undefined)
            return alert('Su navegador no soporta WebGL. Descargue Google Chrome.');
        
        gd.gl.clearColor(0.05, 0.05, 0.05, 1.0);
        gd.gl.enable(gd.gl.DEPTH_TEST);
        gd.gl.depthFunc(gd.gl.LEQUAL);
        gd.gl.clear(gd.gl.COLOR_BUFFER_BIT | gd.gl.DEPTH_BUFFER_BIT); // Correccion tenia doble ||

        this.sombreado.iniciar();
        this.animar();

        window.onload = ejecutar;
    },
    
    

    animar: function()
    {
        requestAnimFrame(gd.core.animar); // Correccion requestAnimationFrame(gd.core.animar);
        gd.core.dibujar();
    },
    
    sombreado: 
    {
        iniciar: function(){
            this.fragments = this.get('shader-fragment');
            this.vertex = this.get('shader-vertex');
            

            this.program = gd.gl.createProgram();

            gd.gl.attachShader(this.program, this.vertex);
            gd.gl.attachShader(this.program, this.fragments);
            gd.gl.linkProgram(this.program);

            if(!gd.gl.getProgramParameter(this.program, gd.gl.LINK_STATUS)){
                return alert("Los sombreados han  fallado en cargar.");
            }

            gd.gl.useProgram(this.program);

            this.store();

            gd.gl.deleteShader(this.fragments);
            gd.gl.deleteShader(this.vertex);
            gd.gl.deleteProgram(this.program);
        },

        get: function(id){
            this.script = document.getElementById(id);
            
            if(!this.script){
                alert('El script no fue encontrado');
                return null;
            }
            this.source = "";
            this.currentChild =this.script.firstChild;

            while(this.currentChild){
                if(this.currentChild.nodeType === this.currentChild.TEXT_NODE){
                    this.source += this.currentChild.textContent;
                }
                this.currentChild = this.currentChild.nextSibling;
            }
            if(this.script.type === 'x-shader/x-fragment'){
                this.sombreado = gd.gl.createShader(gd.gl.FRAGMENT_SHADER);
            }
            else if(this.script.type === 'x-shader/x-vertex'){
                this.sombreado = gd.gl.createShader(gd.gl.VERTEX_SHADER);
            }
            else{
                return null;
            }
            gd.gl.shaderSource(this.sombreado, this.source);
            gd.gl.compileShader(this.sombreado);

            if(!gd.gl.getShaderParameter(this.sombreado, gd.gl.COMPILE_STATUS)){
                alert('Error de complacion del shader: ' + gd.gl.getShaderInfoLog(this.sombreado));
                return null;
            }
            return this.sombreado;
        },
        store: function(){
            this.vertexPositionAttribute = gd.gl.getAttribLocation(
                this.program, "aVertexPosition");
            gd.gl.enableVertexAttribArray(this.vertexPositionAttribute);

            this.vertexColorAttribute = gd.gl.getAttribLocation( // Correccion this.vertexPositionAttribute = gd.gl.getAttribLocation(
                this.program, "aVertexColor");
            gd.gl.enableVertexAttribArray(this.vertexColorAttribute);
            
        }
    },
    
    dibujar: function(){
        gd.gl.clear(gd.gl.COLOR_BUFFER_BIT | gd.gl.DEPTH_BUFFER_BIT);
        
        this.perspectiveMatrix = makePerspective(45, this.horizAspect, 0.1, 300.0);
        
        for(var i in this.storage.all){
            this.loadIdentity();
            
            this.storage.all[i].actualizar();
            
            this.mvTranslate(this.storage.all[i].posicion());
            this.mvPushMatrix();
            
            if(this.storage.all[i].rotar.eje){
                this.mvRotate(
                this.storage.all[i].rotar.angulo,
                this.storage.all[i].rotar.eje);                
            }
            gd.gl.bindBuffer(
            		gd.gl.ARRAY_BUFFER,
            		this.storage.all[i].shapeStorage);
            gd.gl.vertexAttribPointer(
            		this.sombreado.vertexPositionAttribute,
            		this.storage.all[i].shapeColumns,
            		gd.gl.FLOAT,
            		false,0,0);
            
            gd.gl.bindBuffer(
            		gd.gl.ARRAY_BUFFER,
            		this.storage.all[i].colorStorage);
            gd.gl.vertexAttribPointer(
            		this.sombreado.vertexColorAttribute,
            		this.storage.all[i].colorColumns,
            		gd.gl.FLOAT,
            		false,0,0);
            
            this.setMatrixUniforms();
            
            if(this.storage.all[i].indicesStorage){
                gd.gl.drawElements(
                		gd.gl.TRIANGLES,
                		this.storage.all[i].indicesCount,
                		gd.gl.UNSIGNED_SHORT,
                		0);
            } else{
                gd.gl.drawArrays(
                		gd.gl.TRIANGLE_STRIP,
                		0,
                		this.storage.all[i].shapeRows);
            }
            this.mvPopMatrix();
            
            if(this.storage.all[i].type ==='a'){
                for(var en = this.storage.b.length; en--;){
                    if(this.sobreponer(
                        this.storage.all[i].x,
                        this.storage.all[i].y,
                        this.storage.all[i].width,
                        this.storage.all[i].height,
                        this.storage.b[en].x,
                        this.storage.b[en].y,
                        this.storage.b[en].width,
                        this.storage.b[en].height)){
                            this.storage.all[i].chocar(this.storage.b[en]);
                            this.storage.b[en].chocar(this.storage.all[i]);                      
                    }
                }
            }
        }
        this.graveyard.purgar();
    },
    
    graveyard: {
        storage: [],
        purgar: function()
        {
            if(this.storage)
            {
                for(var obj = this.storage.length; obj--;)
                {
                    this.remove(this.storage[obj]);
                }
                this.graveyard = [];
            }
        },
        remove: function(object)
        {
        	var obj; // Correccion no tenia esta declaracion
            for(obj = gd.core.storage.all.length; obj--;)
            {
                if (gd.core.storage.all[obj].id === object.id) // Correccion if(gd.core.store.all[obj.id])
                {
                    gd.core.storage.all.splice(obj, 1);
                    break;
                }
            }
            switch(object.type)
            {
                case 'a':
                    for(obj = gd.core.storage.a.length; obj--;)
                    {
                        if(gd.core.storage.a[obj].id === object.id)
                        {
                            gd.core.storage.a.splice(obj, 1);
                            break;
                        }
                    }
                    break;
                case 'b':
                    for(obj = gd.core.storage.b.length; obj--;)
                    {
                        if(gd.core.storage.b[obj].id === object.id)
                        {
                            gd.core.storage.b.splice(obj, 1);
                            break;
                        }
                    }
                    break
                default:
                    break;
            }
            gd.gl.deleteBuffer(object.colorStorage);
            gd.gl.deleteBuffer(object.shapeStorage);
        }
    },
    
    sobreponer: function(x1,y1, width1, height1, x2, y2, width2, height2)
    {
        x1 = x1 - (width1 / 2);
        y1 = y1 - (height1 / 2);
        x2 = x2 - (width2 / 2);
        y2 = y2 - (height2 / 2);

        return x1 < x2 + width2 &&
                x1 + width1 > x2 &&
                y1 < y2 + width2 &&
                y1 + height1 > y2;
    },
    
    
    loadIdentity: function(){
        mvMatrix =Matrix.I(4);
    },
    
    multMatrix: function(m){
        mvMatrix = mvMatrix.x(m);
    },
    
    mvTranslate: function(v){
        this.multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
    },
    
    setMatrixUniforms: function(){
        var pUniform = gd.gl.getUniformLocation(this.sombreado.program, "uPMatrix");
        gd.gl.uniformMatrix4fv(pUniform, false, new Float32Array(this.perspectiveMatrix.flatten()));
        
        var mvUniform = gd.gl.getUniformLocation(this.sombreado.program, "uMVMatrix");
        // Correccion gd.gl.uniformMatrix4fv(uniform, flase, new Float332Array(mvMatrix.flatten()));
        gd.gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
    },
    
    mvMatrixStack: [],
    
    mvPushMatrix: function(m){
        if(m){
            this.mvMatrixStack.push(m.dup());
            mvMatrix = m.dup();
        } else {
            this.mvMatrixStack.push(mvMatrix.dup());
        }
    },
    
    mvPopMatrix: function(){
        if(! this.mvMatrixStack.length){
            throw("No se puede sacar de una pila de matriz vacia");
        }
        
        mvMatrix = this.mvMatrixStack.pop();
        return mvMatrix;
    },
    
    mvRotate: function(angulo, v) { // Correccion mvRolate: function(angulo, v){
        var inRadians = angulo * Math.PI / 180.0;
        
        // Correcion var m = Matrix.Rotation(inRadians, $V([v], v[1], v[2])).ensure4x4(); 
        var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4(); 
        this.multMatrix(m);
    }
};