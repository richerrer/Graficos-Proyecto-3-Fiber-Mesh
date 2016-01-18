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
			object = getVertexEdgesForSpineTypeS(triangle);
			spinePoints.push(object.newPoints);
			spineEdges.push(object.spineEdges);
			planeEdges.push(object.planeEdges);
		}
	}

	return new Spine(spinePoints,spineEdges,planeEdges);
}

/* Devuelve los puntos de coneccion y su arista correspondiente para un triangulo tipo S (2 aristas internas)
*/
function getVertexEdgesForSpineTypeS(triangle){
	var vertex = [];//Nuevos vertices
	var edge;var v;var a=0;
	var spineE = [];// Arista entre los nuevos vertices
	var planeE = [];//Aristas internas que conforman el triangulo
	if(triangle.type != 1)
		return null;
	for(var i = 0;i < triangle.edges.length ; i++){
		edge = triangle.edges[i];
		if(edge.type == 1){//Si el edge es interno
			planeE.push(edge);
			v = getMidPoint(edge.vertexO,edge.vertexD);//Obtiene el punto medio entre 2 puntos
			vertex.push(v);
			a++;
		}
	}

	if(vertex.length==2)
		spineE.push(new Edge(vertex[0],vertex[1],2));//Agrego el edge que conforma la espina

	return {newPoints:vertex,spineEdges:spineE,planeEdges:planeE};
}

function getMidPoint(v1,v2){
	var newVertex = new Vertex((v1.X+v2.X)/2,(v1.Y+v2.Y)/2,0);
	return newVertex;
}
