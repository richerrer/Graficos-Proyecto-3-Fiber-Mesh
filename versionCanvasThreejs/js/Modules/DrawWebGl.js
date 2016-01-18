
/* Dibuja la linea del sketch generado por el usuario, y lo agrega a una lista 
*/
function drawStrokeLine(point1,point2,list,scene){
	var lineWebGl = newLineWebGlWith2points(point1,point2);	
	list.push(lineWebGl);
	scene.add(lineWebGl);
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


/* Crea una linea con 2 puntos 
*/
function newLineWebGlWith2points(point1,point2){

	// agregamos un material para que el punto tenga color
	var Material=new THREE.PointsMaterial({color:0XFF0000});

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
	var Material=new THREE.MeshPhongMaterial({color:colorTrazo,side:THREE.DoubleSide,shading: THREE.FlatShadin});

	var vector1 = new THREE.Vector3(triangle.v1.X,triangle.v1.Y,triangle.v1.Z);
	var vector2 = new THREE.Vector3(triangle.v2.X,triangle.v2.Y,triangle.v2.Z);
	var vector3 = new THREE.Vector3(triangle.v3.X,triangle.v3.Y,triangle.v3.Z);

	geometry.vertices.push(vector1); 
	geometry.vertices.push(vector2); 
	geometry.vertices.push(vector3);
	geometry.faces.push(new THREE.Face3(0, 1, 2));
	geometry.computeFaceNormals();
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
	var triangleWebGlZnegative = new THREE.Mesh(geometry,Material);
	return [triangleWebGlZpositive,triangleWebGlZnegative];
}

gative

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