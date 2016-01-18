
/* Dado 2 puntos x y que forman ua recta, se procede a devolver los puntos de esa recta, dependiendo del numero enviado por parametro*/
function resamplePoints(v1,v2,resampleValue){
	
	//resampleValue = 5;
	//v1 = new Vertex(9,6,0);
	//v2 = new Vertex(1,0,0);

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
		/*canvas_context.strokeStyle = "rgb(0,0,0)";
		canvas_context.fillStyle = "rgb(0,0,0)";
		canvas_context.fillRect(x, y,2, 2)*/
	}

	//xPoints.push(v2.X);
	points.push(v2);
	distances.push(distance);
	//var resultPoints = [v1];
	//console.info(xPoints,distance);
	
	return {resamplePointsVector:points,distancesVector:distances};

}

/* Obtiene los valores Z para un triangulo , donde v1,v2 forman el spineEdge mientras que v3 el vertice que no pertenece
 * si el type = 1,mientras que si type = 0, v1 es el vertice de la espina y v2 y v3 que no pertenecen a elloa para luego generar los tirangulos 
 * finales a partir de ese triangulo
*/
function getZvalueInTriangle(v1,v2,v3,canvas_context,type){
	
	v1 = new Vertex(474, 138,0);
	v2 = new Vertex(527, 190,0);
	v3 = new Vertex(372, 222,0);

	/* v1 y v2 forman parte de la espina*/
	if(type == 1)
	{
		var finalTriangles = [];
		var rise1 = 100;// La altura que va a crecer dado el vertice v1 que es el promedio a todos los vertices externos
		var rise2 = 100;// La altura que va a crecer dado el vertice v12 que es el promedio a todos los vertices externos
		var sewEdgesPoints1 = getZvalue(v1,v3,rise1,5,canvas_context);//Son los puntos con la coordenada en z desde v1 a v3 despues de la costura
		var sewEdgesPoints2 = getZvalue(v2,v3,rise2,5,canvas_context);//Son los puntos con la coordenada en z desde v3 a v3 despues de la costura
		for(var i = 0; i < sewEdgesPoints1.length; i++){
			var point1 = sewEdgesPoints1[i];
			var point2 = sewEdgesPoints2[i];
			canvas_context.strokeStyle = "rgb(0,0,0)";
			canvas_context.fillStyle = "rgb(0,0,0)";
			canvas_context.fillRect(point1.X, point1.Y,2, 2);
			canvas_context.fillRect(point2.X, point2.Y,2, 2);
		}
		finalTriangles = getFinalTriangles(sewEdgesPoints1,sewEdgesPoints2,1);
		for (var i = 0;i<finalTriangles.length;i++){
			finalTriangles[i].draw3(canvas_context);
			console.info(finalTriangles[i].v1.X,"-400,200-",finalTriangles[i].v1.Y,",",finalTriangles[i].v1.Z);
			console.info(finalTriangles[i].v2.X,"-400,200-",finalTriangles[i].v2.Y,",",finalTriangles[i].v2.Z);
			console.info(finalTriangles[i].v3.X,"-400,200-",finalTriangles[i].v3.Y,",",finalTriangles[i].v3.Z);

		}
	}
	/* v1 forman parte de la espina*/
	if(type == 0)
	{
		var finalTriangles = [];
		var rise1 = 100;// La altura que va a crecer dado el vertice v1 que es el promedio a todos los vertices externos
		var sewEdgesPoints1 = getZvalue(v1,v3,rise1,5,canvas_context);//Son los puntos con la coordenada en z desde v1 a v3 despues de la costura
		var sewEdgesPoints2 = getZvalue(v1,v2,rise2,5,canvas_context);//Son los puntos con la coordenada en z desde v3 a v3 despues de la costura
		for(var i = 0; i < sewEdgesPoints1.length; i++){
			var point1 = sewEdgesPoints1[i];
			var point2 = sewEdgesPoints2[i];
			canvas_context.strokeStyle = "rgb(0,0,0)";
			canvas_context.fillStyle = "rgb(0,0,0)";
			canvas_context.fillRect(point1.X, point1.Y,2, 2);
			canvas_context.fillRect(point2.X, point2.Y,2, 2);
		}
		finalTriangles = getFinalTriangles(sewEdgesPoints1,sewEdgesPoints2,0);
		for (var i = 0;i<finalTriangles.length;i++){
			finalTriangles[i].draw3(canvas_context);
			console.info(finalTriangles[i].v1.X,"-400,200-",finalTriangles[i].v1.Y,",",finalTriangles[i].v1.Z);
			console.info(finalTriangles[i].v2.X,"-400,200-",finalTriangles[i].v2.Y,",",finalTriangles[i].v2.Z);
			console.info(finalTriangles[i].v3.X,"-400,200-",finalTriangles[i].v3.Y,",",finalTriangles[i].v3.Z);

		}
	}
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
		//triangle.draw3(canvas_context);
		//console.info(triangle);
		//console.info("s1",sewEdgesPoints1);
		//console.info("s1",sewEdgesPoints2);
		return finalTriangles;
	}

	if(type==0){
		for(var i = 2; i < sewEdgesPoints1.length-1; i++){
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
		//triangle.draw3(canvas_context);
		//console.info(triangle);
		//console.info("s1",sewEdgesPoints1);
		//console.info("s1",sewEdgesPoints2);
		return finalTriangles;
	}
}

/* Se procede a realizar la elevacion para todos los puntos conformados por 2 vertices, para ello se le da la elevacion correspondiente dada por rise
 * v1 es el vertice donde el valor de Z es es mayor mientras que v2 donde es 0.
*/
function getZvalue(v1,v2,rise,sample,canvas_context){
	//v1 = new Vertex(398,351,0);
	//v2 = new Vertex(698,260,0);

	//rise = 250;
	var points = resamplePoints(v1,v2,sample);
	var vertexPoints = points.resamplePointsVector;//Contiene los puntos del vertice
	var distances = points.distancesVector;//Contiene las distancias de todos los vertexPOints al primer vertice
	var dx = v1.X - v2.X;
	var distance = Math.sqrt(dx * dx);

	if(vertexPoints.length == distances.length){
		for(var i = 0; i < distances.length; i++){
			var value = distances[i];
			var z = rise*(Math.sqrt(1-(value/distance))); //Ecuacion de la elipse
			vertexPoints[i].Z = z;//Asigno el valor de Z

			//canvas_context.strokeStyle = "rgb(0,0,0)";
			//canvas_context.fillStyle = "rgb(0,0,0)";
			//canvas_context.fillRect(vertexPoints[i].X, vertexPoints[i].Z,2, 2)
		}	
	}
	//console.info("puntos con z",vertexPoints);
	return vertexPoints;
	//v1 = new Vertex(334,360,0);
	//v2 = new Vertex(463,286,0);
	//v3 = new Vertex(536,427,0);
	//canvas_context.strokeStyle = "rgb(0,0,0)";
	//canvas_context.fillStyle = "rgb(0,0,0)";
	//canvas_context.fillRect(790, 366,5, 5);
	//canvas_context.fillRect(v2.X, v2.Y,2, 2);
	//canvas_context.fillRect(v3.X, v3.Y,2, 2);
	
}