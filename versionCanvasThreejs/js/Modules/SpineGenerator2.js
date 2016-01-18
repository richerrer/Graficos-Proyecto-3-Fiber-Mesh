/****************************************************Modulo 2*************************/

function generateSpine(plano){
	var triangle;
	var object;
	var spinePoints = [];//Lista de listas que contienen los puntos de la espina (una lista por triangulo)
	var spineEdges = [];//Lista de listas que contienen los edges de la espina (una lista por triangulo)
	var planeEdges = [];//Lista de listas que contienen los edges que cortan las aristas de la espina (edges del triangulo) (una lista por triangulo)
	for(var i = 0; i < plano.length; i++){
		triangle = plano[i];

		/* SI el triangulo es de tipo s*/
		if(triangle.type == 1){
			object = getVertexEdgesForSpine_S_Triangle(triangle);
			spinePoints.push(object.newPoints);
			spineEdges.push(object.spineEdges);
			planeEdges.push(object.planeEdges);
		}
		/* SI el triangulo es de tipo J*/
		if(triangle.type == 2){
			object = getVertexEdgesForSpine_J_Triangle(triangle);
			spinePoints.push(object.newPoints);
			spineEdges.push(object.spineEdges);
			planeEdges.push(object.planeEdges);
		}
		
	}

	return new Spine(spinePoints,spineEdges,planeEdges);
}

/* Devuelve los puntos de coneccion y su arista correspondiente para un triangulo tipo S (2 aristas internas)
*/
function getVertexEdgesForSpine_S_Triangle(triangle){
	var vertex = [];//Nuevos vertices
	var edge;var v;
	var spineE = [];// Arista entre los nuevos vertices
	var planeE = [];//Aristas internas que conforman el triangulo
	if(triangle.type != 1)
		return null;
	for(var i = 0;i < triangle.edges.length ; i++){
		edge = triangle.edges[i];
		if(edge.type == 1){//Si el edge es interno
			planeE.push(edge);
			v = edge.getMidPoint();//Obtiene el punto medio entre 2 puntos
			vertex.push(v);
		}
	}

	if(vertex.length==2)
		spineE.push(new Edge(vertex[0],vertex[1],2));//Agrego el edge que conforma la espina
	//console.info("s ",vertex.length,spineE.length,planeE.length)
	return {newPoints:vertex,spineEdges:spineE,planeEdges:planeE};
}

function getVertexEdgesForSpine_J_Triangle(triangle){
	var vertex = [];//Nuevos vertices
	var spineE = [];// Arista entre los nuevos vertices (forman la espina)
	var planeE = [];//Aristas internas que conforman el triangulo
	if(triangle.type != 2)
		return null;
	var vMidPoint = triangle.getMidPoint();

	var notNullEdges = triangle.getNotNullEdges();
	vertex.push(vMidPoint);
	/* Solo se crean aristas para los edges que no fueron eliminados producto del prunning */
	for(var i = 0; i < notNullEdges.length ; i ++){
		var edge = notNullEdges[i];
		planeE.push(edge);
		var v = edge.getMidPoint();//Obtiene el punto medio entre 2 puntos
		vertex.push(v);
		spineE.push(new Edge(vMidPoint,v,2));//Agrego el edge que conforma la espina
	}	

	//console.info("J- ",vertex.length,spineE.length,planeE.length)
	return {newPoints:vertex,spineEdges:spineE,planeEdges:planeE};
}

function setZvalueToSpine(spine){
	for(var i = 0; i < spine.edges.length;i++){

		/* Si es un triangulo s*/
		if( spine.vertex[i].length == 2 && spine.edges[i].length==1 && spine.planeEdges[i].length == 2){
			var edges = spine.edges[i];
			var vertex = spine.vertex[i];
			var planeEdges = spine.planeEdges[i];

			for(var j = 0; j < vertex.length ; j++){
				var v0 = vertex[j];
				var edgeV0 = planeEdges[0].getMidPoint() == v0 ? planeEdges[0] : planeEdges[1];
				var v1 = edgeV0.vertexO;
				var v2 = edgeV0.vertexD;

				v0.Z = (v0.distance(v1) + v0.distance(v2))/2;
				console.info(" nuevo valor z ",v0.Z)	
			}	
			
		}

		/* La espina es resultado de un triangulo J  :
	 	 * this.vertex = 4 , this.edges = 3 this.planeEdges = 3
	 	 */
		else if(spine.vertex[i].length == 4 && spine.edges[i].length== 3 && spine.planeEdges[i].length == 3){
			var edges = spine.edges[i];
			var vertex = spine.vertex[i];
			var planeEdges = spine.planeEdges[i];

			var e1 = edges[0];
			var e2 = edges[1];
			var e3 = edges[2];
			
			var v1 = planeEdges[0].getMidPoint();
			var v2 = planeEdges[1].getMidPoint();
			var v3 = planeEdges[2].getMidPoint();

			var v0 = getVertexInCommon(e1,e2)[0];

			v0.Z = (v0.distance(v1) + v0.distance(v2) + v0.distance(v3))/3;
			//console.info(" nuevo valor z ",v0.Z)	

			v1.Z = (v1.distance(planeEdges[0].vertexO) + v1.distance(planeEdges[0].vertexD))/2;
			//console.info(" nuevo valor z ",v1.Z)

			v2.Z = (v1.distance(planeEdges[1].vertexO) + v1.distance(planeEdges[1].vertexD))/2;
			//console.info(" nuevo valor z ",v1.Z)

			v3.Z = (v1.distance(planeEdges[2].vertexO) + v1.distance(planeEdges[2].vertexD))/2;
			//console.info(" nuevo valor z ",v1.Z)	
		}
	}
}

/* Dado 2 Edges, se retorna primero el vertice en comun y despues sus 2 otros vertices en orden*/
function getVertexInCommon(edge1,edge2){
	var commonVertex;
	var v1,v2;
	if(edge1.vertexO == edge2.vertexO){
		commonVertex = edge1.vertexO;
		v1 = edge1.vertexD;
		v2 = edge2.vertexD;
	}
	if(edge1.vertexO == edge2.vertexD){
		commonVertex = edge1.vertexO;
		v1 = edge1.vertexD;
		v2 = edge2.vertexO;
	}
	if(edge1.vertexD == edge2.vertexO){
		commonVertex = edge1.vertexD;
		v1 = edge1.vertexO;
		v2 = edge2.vertexD;
	}
	if(edge1.vertexD == edge2.vertexD){
		commonVertex = edge1.vertexD;
		v1 = edge1.vertexO;
		v2 = edge2.vertexO;
	}
	

	return [commonVertex,v1,v2];

}
