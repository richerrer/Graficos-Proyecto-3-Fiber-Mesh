
/* Dibuja la linea del sketch generado por el usuario, y lo agrega a una lista 
*/
function drawStrokeLineWith2points(point1,point2,list,scene){
	var lineWebGl = newLineWebGlWith2points(point1,point2);	
	list.push(lineWebGl);
	scene.add(lineWebGl);
}

function drawStrokeLine(points,scene){
	var lineWebGl = newLineWebGl(points);	
	//list.push(lineWebGl);
	scene.add(lineWebGl);
	return lineWebGl;
}

/* Dibuja y retorna el objeto web gl creado */
function drawPolygonWebGl(polygon,scene,render){
	var polygonWebGl = newPolygonWebGl(polygon);
	scene.add(polygonWebGl);
	return polygonWebGl;
}

/* Dibuja los triangulos contenidos en una lista y retorna los traingulos WebGl en otra lista
* si solid es falso solo dibuja una mesh, sino el solido completo
*/
function drawTriangles(listTriangles,scene,solid){
	var trianglesWebGl = [];
	var triangleWebGl;
	//triangleWebGl = newTriangleSolidWebGl2(listTriangles);

	for(var i=0;i<listTriangles.length;i++){
		var t = listTriangles[i];
		if(!solid){
			triangleWebGl = newTriangleMeshWebGl(t);
			trianglesWebGl.push(triangleWebGl);
			scene.add(triangleWebGl); 
		}
		else{
			triangleWebGl = newTriangleSolidWebGl(t);
			trianglesWebGl.push(triangleWebGl[0]);
			trianglesWebGl.push(triangleWebGl[1]);
			scene.add(triangleWebGl[0]); 
			scene.add(triangleWebGl[1]); 
		}
		
	}
	return trianglesWebGl;
}

/* Retorna el objeto generado en 3d y lo agrega a la escena*/
function draw3dObject(listTriangles,scene,solid,color){
	//var trianglesWebGl = [];
	var triangleWebGl;
	triangleWebGl = generateMesh3dObject(listTriangles,solid,color);
	scene.add(triangleWebGl); 
	return triangleWebGl;
}

/* Crea una linea con 2 puntos 
*/
function newLineWebGl(vertices){

	// agregamos un material para que el punto tenga color
	var Material=new THREE.PointsMaterial({color:0X0000FF,size:10});

	var geometry = new THREE.Geometry();

	//var vertices=points;
	var long_vertices=vertices.length;

	for(i=0;i<long_vertices;i++){
		x=vertices[i][0];
		y=vertices[i][1];
		z=vertices[i][2];
		Vector=new THREE.Vector3(x,y,z);
		geometry.vertices.push(Vector);   
	}
	
	var line = new THREE.Line(geometry,Material);
	//console.info("update",geometry.verticesNeedUpdate,geometry)	
	return line;
}

/* Crea una linea con 2 puntos 
*/
function newLineWebGlWith2points(point1,point2){

	// agregamos un material para que el punto tenga color
	var Material=new THREE.LineBasicMaterial({color:0X00FF00,linewidth:10});

	var geometry = new THREE.Geometry();
	var vertices=[point1,point2];
	var long_vertices=vertices.length;

	for(i=0;i<long_vertices;i++){
		x=vertices[i][0];
		y=vertices[i][1];
		z=vertices[i][2];
		Vector=new THREE.Vector3(x,y,z);
		geometry.vertices.push(Vector);   
	}
	
	var line = new THREE.Line(geometry,Material);	
	return line;
}

/* Crea un poligono webGl en base a un objeto poligono
*/
function newPolygonWebGl(polygon){

	var colorTrazo = "rgb(" + rand(0,255) + "," + rand(0,255) + "," + rand(0,255) + ")"; // da un color al azar al trazo
	var geometry = new THREE.Geometry();
	var Material=new THREE.PointsMaterial({color:colorTrazo});

	for(var i=0;i<polygon.vertex.length;i++){
		var v = polygon.vertex[i];	    
		vector = new THREE.Vector3(v.X,v.Y,v.Z);
		geometry.vertices.push(vector);   
	}
	geometry.vertices.push(new THREE.Vector3(polygon.vertex[0].X,polygon.vertex[0].Y,polygon.vertex[0].Z));   
	var polygonWebGl = new THREE.Line(geometry,Material);

	return polygonWebGl;
}

/* Crea un triangle webGl en base a un objeto Triangle*/
function newTriangleMeshWebGl(triangle){
	var colorTrazo = "rgb(0,0,0)"; // da un color al azar al trazo
	var geometry = new THREE.Geometry();
	var Material=new THREE.LineBasicMaterial({color:colorTrazo,linewidth: 1});

	for(var i = 0; i < triangle.edges.length;i++){
		var e = triangle.edges[i];
		if(e!=null){
		vector1 = new THREE.Vector3(e.vertexO.X,e.vertexO.Y,e.vertexO.Z);
		vector2 = new THREE.Vector3(e.vertexD.X,e.vertexD.Y,e.vertexD.Z);
		geometry.vertices.push(vector1); 
		geometry.vertices.push(vector2); }
	}
	var triangleWebGl = new THREE.Line(geometry,Material);

	return triangleWebGl;
}

/* Crea un triangle webGl en base a un objeto Triangle*/
function newTriangleSolidWebGl(triangle){
	var colorTrazo = "rgb(255,255,0)";; // da un color al azar al trazo
	var geometry = new THREE.Geometry();
	var Material=new THREE.MeshPhongMaterial({color:colorTrazo,side:THREE.FrontSide,shading: THREE.SmoothShading,wireframe: false});

	var vector1 = new THREE.Vector3(triangle.v1.X,triangle.v1.Y,triangle.v1.Z);
	var vector2 = new THREE.Vector3(triangle.v2.X,triangle.v2.Y,triangle.v2.Z);
	var vector3 = new THREE.Vector3(triangle.v3.X,triangle.v3.Y,triangle.v3.Z);

	geometry.vertices.push(vector1); 
	geometry.vertices.push(vector2); 
	geometry.vertices.push(vector3);
	geometry.faces.push(new THREE.Face3(0, 1, 2));
	geometry.computeFaceNormals();

	//var Material= new THREE.Mesh( geometry, new THREE.MeshNormalMaterial() );
	var triangleWebGlZpositive = new THREE.Mesh(geometry,Material);

	geometry = new THREE.Geometry();
	var vector1 = new THREE.Vector3(triangle.v1.X,triangle.v1.Y,-triangle.v1.Z);
	var vector2 = new THREE.Vector3(triangle.v2.X,triangle.v2.Y,-triangle.v2.Z);
	var vector3 = new THREE.Vector3(triangle.v3.X,triangle.v3.Y,-triangle.v3.Z);

	geometry.vertices.push(vector1); 
	geometry.vertices.push(vector2); 
	geometry.vertices.push(vector3);
	geometry.faces.push(new THREE.Face3(0, 1, 2));
	geometry.computeFaceNormals();
	//var Material= new THREE.Mesh( geometry, new THREE.MeshNormalMaterial() );
	var triangleWebGlZnegative = new THREE.Mesh(geometry,Material);
	return [triangleWebGlZpositive,triangleWebGlZnegative];
}

/* Genera el mesh dado una lista de triangulos */
function generateMesh3dObject(triangles,solid,color){

	/*var json = [];
	triangles.forEach(function(triangle,index,array){
		var identedText = JSON.stringify(triangle);
		json.push(identedText);
	});

	triangles = [];
	json.forEach(function(js,index,array){
		var newObject = JSON.parse(js);
		triangles.push(newObject);
	});
	//var identedText = JSON.stringify(triangles[0],null,4);
	//console.info("json",identedText);
	//var newObject = JSON.parse(identedText);
	console.info("parse",triangles);*/
	var geometry = new THREE.Geometry();
	//var Material=new THREE.MeshLambertMaterial({color:color,side:THREE.DoubleSide,shading:THREE.FlatShading,wireframe: solid});
	var Material=new THREE.MeshPhongMaterial({color:color,side:THREE.DoubleSide,wireframe: solid,/*shading:THREE.FlatShading*/});
	//var textura = new THREE.ImageUtils.loadTexture("img/cesped.jpg");
	//var Material = new THREE.MeshLambertMaterial({ map:textura, side:THREE.DoubleSide} );
	
	var vertices = [];
	var mapVertex = new Map();

	/* Genera el mapa de los vertices de un listado de triangulos 
	 * key = valor entero del valor en x y z del vertice
	 * value = indice del vertice que se usara como identificador , el objeto vertice y si el triangulo es tipo negativo o poitivo
	 */
	var generateMapVertex = function(triangles){
		var map = new Map();
		var indiceVertex = 0;
		triangles.forEach(function(triangle,index,array){
			[triangle.v1,triangle.v2,triangle.v3].forEach(function(vertex,index2,arrayVertex){
				/* Positive */
				var key = parseInt(vertex.X).toString()+parseInt(vertex.Y).toString()+parseInt(vertex.Z).toString();
				if(!map.has(key)){
					map.set(key,{indexValue:indiceVertex,vertex:vertex,negative:false});
					indiceVertex++;
				}
				/* Negative */
				var key = parseInt(vertex.X).toString()+parseInt(vertex.Y).toString()+parseInt(-vertex.Z).toString();
				if(!map.has(key)){
					map.set(key,{indexValue:indiceVertex,vertex:vertex,negative:true});
					indiceVertex++;
				}
			});
		});
		return map;
	};
	var mapVertex = generateMapVertex(triangles);
	

	/* Agrgeo los vertices a la geometria 
	*/
	mapVertex.forEach(function(value,key,map){
		var vector;
		if(!value.negative) //Positivo
			vector = new THREE.Vector3(value.vertex.X,value.vertex.Y,value.vertex.Z);
		else // Negativo
			vector = new THREE.Vector3(value.vertex.X,value.vertex.Y,-value.vertex.Z);
		geometry.vertices.push(vector); 
	});

	/* Agrego las caras de los triangulos
	*/
	triangles.forEach(function(triangle,index,array){
		/* Positive */
		var key0 = parseInt(triangle.v1.X).toString()+parseInt(triangle.v1.Y).toString()+parseInt(triangle.v1.Z).toString();
		var key1 = parseInt(triangle.v2.X).toString()+parseInt(triangle.v2.Y).toString()+parseInt(triangle.v2.Z).toString();
		var key2 = parseInt(triangle.v3.X).toString()+parseInt(triangle.v3.Y).toString()+parseInt(triangle.v3.Z).toString();
		if( ! (mapVertex.has(key0) && mapVertex.has(key1) && mapVertex.has(key2)) ){
			console.info(" Error al encontrar key");
			return
		}

		var i0 = mapVertex.get(key0).indexValue;
		var i1 = mapVertex.get(key1).indexValue;
		var i2 = mapVertex.get(key2).indexValue;
		/* A favor de las manecillas del reloj por defecto se encuentran los triangulos ordenados de esta manera */
		geometry.faces.push(new THREE.Face3(i0, i1, i2));
		//geometry.faceVertexUvs[0].push([new THREE.Vector2(0,0),new THREE.Vector2(.5,0),new THREE.Vector2(.5,.5)]);
		/* Negative */
		var key0 = parseInt(triangle.v1.X).toString()+parseInt(triangle.v1.Y).toString()+parseInt(-triangle.v1.Z).toString();
		var key1 = parseInt(triangle.v2.X).toString()+parseInt(triangle.v2.Y).toString()+parseInt(-triangle.v2.Z).toString();
		var key2 = parseInt(triangle.v3.X).toString()+parseInt(triangle.v3.Y).toString()+parseInt(-triangle.v3.Z).toString();
		if( ! (mapVertex.has(key0) && mapVertex.has(key1) && mapVertex.has(key2)) ){
			console.info(" Error al encontrar key");
			return
		}
		var i0 = mapVertex.get(key0).indexValue;
		var i1 = mapVertex.get(key1).indexValue;
		var i2 = mapVertex.get(key2).indexValue;
		/* En contra de las manecillas del reloj */
		geometry.faces.push(new THREE.Face3(i0, i2, i1));
		//geometry.faceVertexUvs[0].push([new THREE.Vector2(0,0),new THREE.Vector2(1,0),new THREE.Vector2(1,1)]);
	});

	geometry.computeFaceNormals();
	geometry.computeVertexNormals();
	
	var triangleWebGlZpositive = new THREE.Mesh(geometry,Material);
	//console.info(" triangulos orginales ",triangles.length,geometry.faces.length/2)
	return triangleWebGlZpositive;
}

function generateMesh3dObject2(triangles,solid,color){
	var geometry = new THREE.Geometry();
	//var Material=new THREE.MeshLambertMaterial({color:color,side:THREE.DoubleSide,shading:THREE.FlatShading,wireframe: solid});
	var Material=new THREE.MeshPhongMaterial({color:color,side:THREE.DoubleSide,wireframe: solid,/*shading:THREE.FlatShading*/});
	var vertices = [];
	var mapVertex = new Map();

	/* Genera el mapa de los vertices de un listado de triangulos 
	 * key = valor entero del valor en x y z del vertice
	 * value = indice del vertice que se usara como identificador , el objeto vertice y si el triangulo es tipo negativo o poitivo
	 */
	var generateMapVertex = function(triangles){
		var map = new Map();
		var indiceVertex = 0;
		triangles.forEach(function(triangle,index,array){
			[triangle.v1,triangle.v2,triangle.v3].forEach(function(vertex,index2,arrayVertex){
				/* Positive */
				var key = parseInt(vertex.X).toString()+parseInt(vertex.Y).toString()+parseInt(vertex.Z).toString();
				if(!map.has(key)){
					map.set(key,{indexValue:indiceVertex,vertex:vertex,negative:false});
					indiceVertex++;
				}
			});
		});
		return map;
	};
	var mapVertex = generateMapVertex(triangles);
	

	/* Agrgeo los vertices a la geometria 
	*/
	mapVertex.forEach(function(value,key,map){
		var vector;
		//if(!value.negative) //Positivo
		vector = new THREE.Vector3(value.vertex.X,value.vertex.Y,value.vertex.Z);
		//else // Negativo
			//vector = new THREE.Vector3(value.vertex.X,value.vertex.Y,-value.vertex.Z);
		geometry.vertices.push(vector); 
	});

	/* Agrego las caras de los triangulos
	*/
	triangles.forEach(function(triangle,index,array){
		/* Positive */
		var key0 = parseInt(triangle.v1.X).toString()+parseInt(triangle.v1.Y).toString()+parseInt(triangle.v1.Z).toString();
		var key1 = parseInt(triangle.v2.X).toString()+parseInt(triangle.v2.Y).toString()+parseInt(triangle.v2.Z).toString();
		var key2 = parseInt(triangle.v3.X).toString()+parseInt(triangle.v3.Y).toString()+parseInt(triangle.v3.Z).toString();
		if( ! (mapVertex.has(key0) && mapVertex.has(key1) && mapVertex.has(key2)) ){
			console.info(" Error al encontrar key");
			return
		}

		var i0 = mapVertex.get(key0).indexValue;
		var i1 = mapVertex.get(key1).indexValue;
		var i2 = mapVertex.get(key2).indexValue;
		/* A favor de las manecillas del reloj por defecto se encuentran los triangulos ordenados de esta manera */
		geometry.faces.push(new THREE.Face3(i2, i1, i0));
	});

	geometry.computeFaceNormals();
	geometry.computeVertexNormals();
	
	var triangleWebGlZpositive = new THREE.Mesh(geometry,Material);
	//console.info(" triangulos orginales ",triangles.length,geometry.faces.length/2)
	return triangleWebGlZpositive;
}



function draw(obj,escena,render,object3D)
{
	if(obj instanceof Polygon){
		drawPolygonBorders(obj,escena,render);
		return
	}
	if(obj instanceof Triangle){
		//drawTriangle(obj,escena,render,object3D);
		drawTriangleBorders(obj,escena,render,object3D);
		return
	}
	console.info("No se como dibujar este objeto");
}


function drawTriangleBorders(triangle,escena,render,object3D)
{	
	var colorTrazo = "rgb(0,0,0)"; // da un color al azar al trazo
	/*if(triangle.type==0){var colorTrazo = "rgb(255,0,0)";}
	if(triangle.type==1){var colorTrazo = "rgb(0,255,0)";}
	if(triangle.type==2){
		if(triangle.edges[0]==null ||triangle.edges[1]==null ||triangle.edges[2]==null)
			var colorTrazo = "rgb(0,255,255)";
		else
			var colorTrazo = "rgb(0,0,255)";
	}
	if(triangle.type==3){var colorTrazo = "rgb(255,255,0)";}
	if(triangle.type==4){var colorTrazo = "rgb(255,0,255)";}*/
	var geometry = new THREE.Geometry();
	var Material=new THREE.LineBasicMaterial({color:colorTrazo,linewidth: 1});

	for(var i = 0; i < triangle.edges.length;i++){
		var e = triangle.edges[i];
		if(e!=null){
		vector1 = new THREE.Vector3(e.vertexO.X,e.vertexO.Y,e.vertexO.Z);
		vector2 = new THREE.Vector3(e.vertexD.X,e.vertexD.Y,e.vertexD.Z);
		geometry.vertices.push(vector1); 
		geometry.vertices.push(vector2); }
	}

	/*vector1 = new THREE.Vector3(triangle.v1.X,triangle.v1.Y,triangle.v1.Z);
	vector2 = new THREE.Vector3(triangle.v2.X,triangle.v2.Y,triangle.v2.Z);
	vector3 = new THREE.Vector3(triangle.v3.X,triangle.v3.Y,triangle.v3.Z);

	geometry.vertices.push(vector1); 
	geometry.vertices.push(vector2); 
	geometry.vertices.push(vector3); 
 	geometry.vertices.push(vector1); */
	var drawTriangle = new THREE.Line(geometry,Material);

	escena.add(drawTriangle);
	object3D.push(drawTriangle);

	/*var geometry = new THREE.Geometry();
	vector1 = new THREE.Vector3(triangle.v1.X,triangle.v1.Y,-triangle.v1.Z);
	vector2 = new THREE.Vector3(triangle.v2.X,triangle.v2.Y,-triangle.v2.Z);
	vector3 = new THREE.Vector3(triangle.v3.X,triangle.v3.Y,-triangle.v3.Z);

	geometry.vertices.push(vector1); 
	geometry.vertices.push(vector2); 
	geometry.vertices.push(vector3); 
 
	var drawTriangle = new THREE.Line(geometry,Material);*/

	//escena.add(drawTriangle);
	//object3D.push(drawTriangle);
	//render();
}

function drawTriangle(triangle,escena,render,object3D)
{	
	var colorTrazo = "rgb(255,0,0)";
	if(triangle.type==0){var colorTrazo = "rgb(255,0,0)";}
	if(triangle.type==1){var colorTrazo = "rgb(0,255,0)";}
	if(triangle.type==2){
		if(triangle.edges[0]==null ||triangle.edges[1]==null ||triangle.edges[2]==null)
			var colorTrazo = "rgb(0,255,255)";
		else
			var colorTrazo = "rgb(0,0,255)";
	}
	if(triangle.type==3){var colorTrazo = "rgb(255,255,0)";}
	if(triangle.type==4){var colorTrazo = "rgb(255,0,255)";}

	var colorTrazo = "rgb(" + rand(0,255) + "," + rand(0,255) + "," + rand(0,255) + ")";

	var material = new THREE.MeshLambertMaterial({color: colorTrazo, side:THREE.DoubleSide});
	

	var geometry = new THREE.Geometry();
	vector1 = new THREE.Vector3(triangle.v1.X,triangle.v1.Y,-triangle.v1.Z);
	vector2 = new THREE.Vector3(triangle.v2.X,triangle.v2.Y,-triangle.v2.Z);
	vector3 = new THREE.Vector3(triangle.v3.X,triangle.v3.Y,-triangle.v3.Z);

	geometry.vertices.push(vector1); 
	geometry.vertices.push(vector2); 
	geometry.vertices.push(vector3); 

	geometry.faces.push(new THREE.Face3(0, 1, 2));
	var drawTriangle = new THREE.Mesh(geometry, material);

	//escena.add(drawTriangle);
	//object3D.push(drawTriangle);
	
	var geometry = new THREE.Geometry();

	vector1 = new THREE.Vector3(triangle.v1.X,triangle.v1.Y,triangle.v1.Z);
	vector2 = new THREE.Vector3(triangle.v2.X,triangle.v2.Y,triangle.v2.Z);
	vector3 = new THREE.Vector3(triangle.v3.X,triangle.v3.Y,triangle.v3.Z);

	geometry.vertices.push(vector1); 
	geometry.vertices.push(vector2); 
	geometry.vertices.push(vector3); 

	geometry.faces.push(new THREE.Face3(0, 1, 2));
	var drawTriangle = new THREE.Mesh(geometry, material);

	escena.add(drawTriangle);
	object3D.push(drawTriangle);
}


function rand(low, high)
{
	return Math.floor((high - low + 1) * Math.random()) + low;
}


/*function drawElipse(spine,scene){

	for (var i = 0; i< spine.vertex.length;i++){
		var vertex = spine.vertex[i];
		for(var j = 0;j< vertex.length;j++){
			var v = vertex[j];
			console.info(v);
			var curve = new THREE.EllipseCurve(
				0,  0,            // ax, aY
				10, 10,           // xRadius, yRadius
				0,  2 * Math.PI,  // aStartAngle, aEndAngle
				false,            // aClockwise
				0                 // aRotation 
			);

			var path = new THREE.Path( curve.getPoints( 50 ) );
			var geometry = path.createPointsGeometry( 50 );
			var material = new THREE.MeshLambertMaterial( { color : 0xff0000 } );

			// Create the final Object3d to add to the scene
			var ellipse = new THREE.Line( geometry, material );
			ellipse.position.set(v.X,v.Y,v.Z);
		}

		scene.add(ellipse);
	}	
}*/