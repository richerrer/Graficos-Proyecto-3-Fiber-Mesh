/* Genera el objeto en 3d recibiendo como parametro la esina dorsal y los triangulos finales, asi como el numero de puntos 
* a muestrear para cada vertice del triangulo.
*/
function generate3dObject(spine,triangles,samples){

	/* Conjunto de triangulos resultantes que forman el objetos*/
	var object3D = [];

	/* Vertices que forman la espina, (no se repiten)*/
	var spineVertex = getSpineVertex(spine);

	/* Lista de diccionarios con los vertices de los triangulos base para formar los resultantes*/
	var nTriangles = manageTriangles(spineVertex,triangles);

	/* Mapa con los vertices de cada edge junto con su elevacion*/
	var spineHeight = getDistanceForSpineVertex2(spineVertex,triangles);
	var spineHeight = getDistanceForSpineVertex(spineVertex,nTriangles);
	
	for(var i = 0; i< nTriangles.length;i++){
		var t = nTriangles[i];
		var v1 = t.vTriangle[0];
		var v2 = t.vTriangle[1];
		var v3 = t.vTriangle[2];
		var type = t.type;
		object3D = object3D.concat(getZvalueInTriangle(v1,v2,v3,spineHeight,type,samples));
	}
	return object3D;
}


/* Dado los vertices que conforman la espina y los vertices de los triangulos, devuelve una lista de diccionarios,
* en donde cada diccinario tiene un atributo que muestra (0) si el triangulo tiene 1 vertice contenido en la espina
* y (1) si contiene 2 vertices contenidos en la espina, ademas de los vertices que conforman el triangulo ordenados,
* el primero y segundo vertice son siempre los vertices que se encuentran dentro de la espina
*/
function manageTriangles(spineVertex,triangles)
{
	/* Triangululos Finales */
	var resultTriangles = [];

	for(var i = 0;i < triangles.length;i++){
		var t = triangles[i];

		/* Vertices que pertenecen a la espina */
		var inSpine = [];
		/* Vertices que no pertenecen a la espina */
		var outSpine = [];

		var vertex = [t.v1,t.v2,t.v3];

		for(var j = 0; j < vertex.length; j++){
			var v = vertex[j];

			/* Si el vertice se encuentra en la espina */
			if(spineVertex.indexOf(v)!=-1)
				inSpine.push(v);

			/* Si el vertice se encuentra fuera de la espina */
			else
				outSpine.push(v);
		}

		/* Tipo 1 si contiene 2 vertices contenidos en la espina*/
		if(inSpine.length == 2 && outSpine.length == 1){
			/* Ordeno los vertices de los triangulos */
			var nTriangle = {vTriangle:[inSpine[0],inSpine[1],outSpine[0]],type:1};
			resultTriangles.push(nTriangle);
		}
		/* Tipo 0 si contiene 1 vertice contenido en la espina*/
		else if (inSpine.length == 1 && outSpine.length == 2){

			var nTriangle = {vTriangle:[inSpine[0],outSpine[0],outSpine[1]],type:0};
			resultTriangles.push(nTriangle);
		}
		else{
			console.info("Ocurrior un error en la funcion manageTriangles modulo Elevation");
		}

	}

	return resultTriangles;
}

/* Dada la espina, genera una lista con los vertices que la conforman, sin repetir*/
function getSpineVertex(spine)
{
	var vertex = spine.vertex;
	var resultSpineVertex = [];

	for(var i = 0; i< vertex.length;i++){
		var arrayV = vertex[i];
		for(var j = 0; j < arrayV.length ; j++){
			var v = arrayV[j];
			var index = resultSpineVertex.indexOf(v);
			if(index==-1)
				resultSpineVertex.push(v);
		}
	}
	return resultSpineVertex;
}

/* Dvuelve la distancias de todos los vertices de la espina a sus vertices externos (Map)*/
function getDistanceForSpineVertex(spineVertex,triangleVertex){
	var mapSpineHeight = new Map();

	for(var i = 0; i < spineVertex.length;i++){
		
		/* Vertice de la espina */
		var spineV = spineVertex[i];

		/* Distancia acumulada a todos los vertices externos */
		var distance = 0;

		/* Numero de vertices externos */
		var num = 0;
		
		for(var j = 0; j< triangleVertex.length;j++){
			var t = triangleVertex[j];
			var type = t.type;
			var vertex = t.vTriangle;

			/* Verifica si se encuentra el vertice en la lista de vertices*/
			if(vertex.indexOf(spineV)!=-1){
				/* Tiene 2 vertices externos*/
				if(type == 0){
					var v1 = vertex[1];
					var v2 = vertex[2];

					distance = distance + spineV.distance(v1);
					distance = distance + spineV.distance(v2);
					num = num +2;
				}
				/* Tiene 1 vertice externo*/
				else if(type == 1){
					var v1 = vertex[2];
					distance = distance + spineV.distance(v1);
					num = num +1;
				}
			}
		}
		//console.info("vertice espina ",i," elevacion",distance/num," verices externos ",num)
		mapSpineHeight.set(spineV,(distance/num));
	}

	return mapSpineHeight;
}

/* Dvuelve la distancias de todos los vertices de la espina a sus vertices externos (Map)*/
function getDistanceForSpineVertex2(spineVertex,triangles){
	var mapSpineHeight = new Map();

	for(var i = 0; i < spineVertex.length;i++){
		
		/* Vertice de la espina */
		var spineV = spineVertex[i];

		/* Distancia acumulada a todos los vertices externos */
		var distance = 0;

		/* Numero de vertices externos */
		var num = 0;
		
		for(var j = 0; j< triangles.length;j++){
			var t = triangles[j];
			for(var l =0; l< t.edges.length;l++)
			{
				var edge = t.edges[l];
				if(edge.vertexO == spineV && spineVertex.indexOf(edge.vertexD)==-1){
					distance = distance + edge.vertexD.distance(spineV);
					num++;
				}
				else if(edge.vertexD == spineV && spineVertex.indexOf(edge.vertexO)==-1){
					distance = distance + edge.vertexO.distance(spineV);
					num++;
				}
			}

		}
		//console.info("vertice espina 2 forma",i," elevacion",distance/num," verices externos ",num)
		mapSpineHeight.set(spineV,(distance/num));
	}

	return mapSpineHeight;
}


/* Dado 2 puntos x y que forman ua recta, se procede a devolver los puntos de esa recta, dependiendo del numero enviado por parametro*/
function resamplePoints(v1,v2,resampleValue){

	var dx = v1.X - v2.X;
	var distance = Math.sqrt(dx * dx);
	var step = (distance/(resampleValue-1));

	step = v1.X > v2.X ? -step:step;
	var xPoints = [v1.X];
	var points = [v1];
	var A = v2.Y - v1.Y;
	var B = -(v2.X - v1.X);
	var C = (-B*v1.Y) - A*v1.X;
	var distances = [0];//Son las distancias de todos los puntos X al vertice v1, el primer valor es 0  ya la longitud de v1 a v1 es 0 
	for(var i = 0; i < resampleValue -2; i++){
		var x = xPoints[xPoints.length -1]+step;
		var y = (-A/B)*x - (C/B);
		xPoints.push(x);
		points.push(new Vertex(x,y,0));
		distances.push(Math.abs(step*(i+1)));
	}

	points.push(v2);
	distances.push(distance);
	
	return {resamplePointsVector:points,distancesVector:distances};

}

/* Dado 2 puntos x y que forman ua recta, se procede a devolver los puntos de esa recta, dependiendo del numero enviado por parametro*/
function resamplePoints2(v1,v2,resampleValue){

	var dx = v1.X - v2.X;
	var distance = Math.sqrt(dx * dx);
	var step = (distance/(resampleValue-1));

	step = v1.X > v2.X ? -step:step;
	var xPoints = [v1.X];
	var points = [v1];
	var A = v2.Y - v1.Y;
	var B = -(v2.X - v1.X);
	var C = (-B*v1.Y) - A*v1.X;
	var distances = [0];//Son las distancias de todos los puntos X al vertice v1, el primer valor es 0  ya la longitud de v1 a v1 es 0 
	for(var i = 0; i < resampleValue -2; i++){
		var x = xPoints[xPoints.length -1]+step;
		var y = (-A/B)*x - (C/B);
		xPoints.push(x);
		var vertice = new Vertex(x,y,0);
		points.push(vertice);
		distances.push(v1.distance(vertice));
	}

	points.push(v2);
	distances.push(v1.distance(v2));
	
	return {resamplePointsVector:points,distancesVector:distances};

}

/* Obtiene los valores Z para un triangulo , donde v1,v2 forman el spineEdge mientras que v3 el vertice que no pertenece
 * si el type = 1,mientras que si type = 0, v1 es el vertice de la espina y v2 y v3 que no pertenecen a elloa para luego generar los tirangulos 
 * finales a partir de ese triangulo
 * height un map con las elevaciones para cada vertice de la espina
 * Samples son los puntos que se muestrearan para cada vertice del triangulo
*/
function getZvalueInTriangle(v1,v2,v3,heigh,type,samples){
	
	var finalTriangles = [];
	var rise1;
	var rise1;
	var sewEdgesPoints1;
	var sewEdgesPoints2;
	rise1 = 50;
	rise2 = 50;
	var value = 1.5;
	/* v1 y v2 forman parte de la espina*/
	if(type == 1)
	{
		//rise1 = heigh.get(v1)/value;// La altura que va a crecer dado el vertice v1 que es el promedio a todos los vertices externos
		//rise2 = heigh.get(v2)/value;// La altura que va a crecer dado el vertice v2 que es el promedio a todos los vertices externos
		sewEdgesPoints1 = getZvalue2(v1,v3,rise1,samples);//Son los puntos con la coordenada en z desde v1 a v3 despues de la costura
		sewEdgesPoints2 = getZvalue2(v2,v3,rise2,samples);//Son los puntos con la coordenada en z desde v3 a v3 despues de la costura
		finalTriangles = getFinalTriangles(sewEdgesPoints1,sewEdgesPoints2,1);
	}

	/* v1 forman parte de la espina*/
	else if(type == 0)
	{	
		
		//rise1 = heigh.get(v1)/value;// La altura que va a crecer dado el vertice v1 que es el promedio a todos los vertices externos
		sewEdgesPoints1 = getZvalue2(v1,v3,rise1,samples);//Son los puntos con la coordenada en z desde v1 a v3 despues de la costura
		sewEdgesPoints2 = getZvalue2(v1,v2,rise1,samples);//Son los puntos con la coordenada en z desde v3 a v3 despues de la costura
		finalTriangles = getFinalTriangles(sewEdgesPoints1,sewEdgesPoints2,0);
	}
	return finalTriangles;
}

/* Se procede a realizar la elevacion para todos los puntos conformados por 2 vertices, para ello se le da la elevacion correspondiente dada por rise
 * v1 es el vertice donde el valor de Z es es mayor mientras que v2 donde es 0.
*/
function getZvalue(v1,v2,rise,sample){
	
	var points = resamplePoints(v1,v2,sample);
	var vertexPoints = points.resamplePointsVector;//Contiene los puntos del vertice
	var distances = points.distancesVector;//Contiene las distancias de todos los vertexPOints al primer vertice
	var dx = v1.X - v2.X;
	var distance = Math.sqrt(dx * dx);
	var b = rise;
	var a = v2.distance(v1);

	if(vertexPoints.length == distances.length){
		for(var i = 0; i < distances.length; i++){
			var value = distances[i];
			var z = rise*(Math.sqrt(1-(value/distance))); //Ecuacion de la elipse
			//var z = b*(Math.sqrt(1-((value*value)/(a*a)))); //Ecuacion de la elipse
			vertexPoints[i].Z = z;//Asigno el valor de Z
			//console.info(z);
		}	
	}
	return vertexPoints;
}

function getZvalue2(v1,v2,rise,sample){
	
	var points = resamplePoints2(v1,v2,sample);
	var vertexPoints = points.resamplePointsVector;//Contiene los puntos del vertice
	var distances = points.distancesVector;//Contiene las distancias de todos los vertexPOints al primer vertice
	
	var a = v1.distance(v2);
	var b = rise;

	if(vertexPoints.length == distances.length){
		for(var i = 0; i < distances.length; i++){
			var L = distances[i];
			var z = b*(Math.sqrt(1-((L*L)/(a*a)))); //Ecuacion de la elipse
			//var z = b*(Math.sqrt(1-((value*value)/(a*a)))); //Ecuacion de la elipse
			vertexPoints[i].Z = z;//Asigno el valor de Z
			//console.info(z);
		}	
	}
	return vertexPoints;
}


/* Genera los triangulos finales usando los puntos de elevacion*/
function getFinalTriangles(sewEdgesPoints1,sewEdgesPoints2,type){
	var t1 ,t2,t3,e1,e2,e3,triangle;
	var finalTriangles = [];
	/* Si 2 vertices pertenecen a la espina dorsal*/
	if(type==1){
		for(var i = 1; i < sewEdgesPoints1.length-1; i++){
			/* Genera el primer triangulo*/
			t1 = sewEdgesPoints1[i-1];
			t2 = sewEdgesPoints2[i-1];
			t3 = sewEdgesPoints2[i];
			e1 = new Edge(t1,t2,5);
			e2 = new Edge(t1,t3,5);
			e3 = new Edge(t2,t3,5);

			triangle = new Triangle(t1,t2,t3,[e1,e2,e3]);
			finalTriangles.push(triangle);
			/* Genera el segundo triangulo*/
			t1 = sewEdgesPoints1[i-1];
			t2 = sewEdgesPoints2[i];
			t3 = sewEdgesPoints1[i];
			e1 = new Edge(t1,t2,5);
			e2 = new Edge(t1,t3,5);
			e3 = new Edge(t2,t3,5);

			triangle = new Triangle(t1,t2,t3,[e1,e2,e3]);
			finalTriangles.push(triangle);
			//triangle.draw3(canvas_context);
			//console.info(triangle);
		}
		/* Genera el ultimo triangulo*/
		t1 = sewEdgesPoints1[sewEdgesPoints1.length - 2];
		t2 = sewEdgesPoints2[sewEdgesPoints1.length - 2];
		t3 = sewEdgesPoints2[sewEdgesPoints2.length - 1];
		e1 = new Edge(t1,t2,5);
		e2 = new Edge(t1,t3,5);
		e3 = new Edge(t2,t3,5);

		triangle = new Triangle(t1,t2,t3,[e1,e2,e3]);
		finalTriangles.push(triangle);
		return finalTriangles;
	}

	else if(type==0){
		for(var i = 2; i < sewEdgesPoints1.length; i++){
			/* Genera el primer triangulo*/
			t1 = sewEdgesPoints1[i-1];
			t2 = sewEdgesPoints2[i-1];
			t3 = sewEdgesPoints1[i];
			e1 = new Edge(t1,t2,5);
			e2 = new Edge(t1,t3,5);
			e3 = new Edge(t2,t3,5);

			triangle = new Triangle(t1,t2,t3,[e1,e2,e3]);
			finalTriangles.push(triangle);
			
			/* Genera el segundo triangulo*/
			t1 = sewEdgesPoints1[i];
			t2 = sewEdgesPoints2[i-1];
			t3 = sewEdgesPoints2[i];
			e1 = new Edge(t1,t2,5);
			e2 = new Edge(t1,t3,5);
			e3 = new Edge(t2,t3,5);

			triangle = new Triangle(t1,t2,t3,[e1,e2,e3]);
			finalTriangles.push(triangle);
			//triangle.draw3(canvas_context);
			//console.info(triangle);
		}
		/* Genera el ultimo triangulo*/
		t1 = sewEdgesPoints1[0];
		t2 = sewEdgesPoints1[1];
		t3 = sewEdgesPoints2[1];
		e1 = new Edge(t1,t2,5);
		e2 = new Edge(t1,t3,5);
		e3 = new Edge(t2,t3,5);

		triangle = new Triangle(t1,t2,t3,[e1,e2,e3]);
		finalTriangles.push(triangle);

		return finalTriangles;
	}
}
