/*........................................Clase Vertex...................................................................
*/

/**
* Crea un objeto de tipo Vertex
* @param {double} X coordenada en X 
* @param {double} Y coordenada en Y
* @param {double} Z coordenada en Z
*/

function Vertex(X,Y,Z){
	this.X = X;
	this.Y = Y;
	this.Z = Z;
	/*this.X = parseInt(X);
	this.Y = parseInt(Y);
	this.Z = parseInt(Z);*/
}

/**
* Calcula la distancia entre el vertice de clase y un vertice enviado por parametro
* @param {Vertex} v vertice al que se desea la distancia
* @returns {double} distancia al vertice 
*/

Vertex.prototype.distance = function(v)
{
	var dx = this.X - v.X;
	var dy = this.Y - v.Y;
	return Math.sqrt(dx * dx + dy * dy);
}

/**
* Dada una lista de vertices, retorna el vertice mas cercano al vertice de clase
* @param {Array} vertex Lista de vertices
* @returns {Vertex} el vertice mas cercano
*/

Vertex.prototype.closeVertex = function(vertex){
	var v;
	var close = vertex[0];
	var minDistance = this.distance(close);
	var distance;

	for(var i = 1; i < vertex.length; i++){
		v = vertex[i];
		distance = this.distance(v);
		if(distance<minDistance){
			close = v;
			minDistance = distance;
		}
	}
	return close;
}






/*........................................Clase Edge...................................................................*/


/**
* Crea un objeto de tipo Edge
* @param {Vertex} vertexO vertice de origen
* @param {Vertex} vertexD vertice de destino
*/

function Edge(vertexO,vertexD,type){
	
	/* Vertice de origen */
	this.vertexO = vertexO;

	/* Vertice de destino */
	
	this.vertexD = vertexD;

	/* Punto Medio del Edge */
	this.vMidPoint = this.getMidPoint();

	/* Tipo de Edge 
	 * Si es 0 es externa 
	 * si es 1 es interna 
	 * si es 2 es producto de la espina 
	 * si es 3 si es un nuevo edge producto del pruning 
	 * si es 4 es produto de la generacion de un nuevo triangulo creado por la espina
	 * si es 5 es del triangulo final
	 */
	this.type = type;
	
}

/**
* Calcula el punto medio de un edge
* @returns {Vertex} el punto medio de la arista
*/

Edge.prototype.getMidPoint = function(){

	var X = (this.vertexO.X+this.vertexD.X)/2;
	var Y = (this.vertexO.Y+this.vertexD.Y)/2;

	if(this.vMidPoint ==null){
		this.vMidPoint = new Vertex(X,Y,0);
		return this.vMidPoint;
	}

	this.vMidPoint.X = X;
	this.vMidPoint.Y = Y;

	return this.vMidPoint;
}






/*........................................Clase Poligono...................................................................*/

/**
* Crea un objeto de tipo Polygon que representa el stroke generado por el usuario
* @param {Array} vertex Lista de vertices que pertenecen al poligono
* @param {Array} edges Lista de edges que pertenecen al poligono
*/

function Polygon(vertex,edges){
	this.edges = edges;
	this.vertex = vertex;
}


/**
* Remueve un vertice de la lista de vertices
* @param {Vertex} vertex Vertice a remover
*/

Polygon.prototype.removeVertex = function(vertex){
	
	var index = this.vertex.indexOf(vertex);
	if(index >-1){this.vertex.splice(index,1);}
	
}


/**
* Dado 2 vertices, devuelve el Edge que contiene esos 2 vertices
* @param {Vertex} v1 Vertice 
* @param {Vertex} v2 Vertice
* @returns {Edge} el Edge que contiene a los 2 vertices
*/

Polygon.prototype.getEdge = function(v1,v2){
	var edge = null;
	for(var i = 0;i < this.edges.length;i++){
		edge = this.edges[i];
		if((edge.vertexO == v1 && edge.vertexD == v2)||(edge.vertexO == v2 && edge.vertexD == v1))
			return edge;
	}
	
}

/**
* Dado 1 vertice, devuelve una lista de Edges que contienen a ese vertice
* @param {Vertex} v1 Vertice 
* @returns {Array} la lista de edges
*/

Polygon.prototype.getEdgesFromVertex = function(v1){
	var edges = [];
	for(var i = 0;i < this.edges.length;i++){
		edge = this.edges[i];
		if((edge.vertexO == v1 || edge.vertexD == v1))
			edges.push(edge);
	}
	return edges;
}

/**
* Remueve los Edges de una lista, y agrega un nuevo Edge
* @param {Array} oldEdges Lista de Edges a eliminar
* @param {Edge} newEdge Edge a añadir
* @returns {Bool} Si se agrego y eliminaron los Edges
*/

Polygon.prototype.updateEdges = function(oldEdges,newEdge){
	var edges=this.edges;
	var edge,index,index2;
	if(oldEdges.length != 2 || newEdge == null){
		return false;
	}
	index = this.edges.indexOf(oldEdges[0]);
	if(index >-1){this.edges.splice(index,1);}
	else{return false;}
	index = this.edges.indexOf(oldEdges[1]);
	if(index >-1){this.edges.splice(index,1);}
	else{return false;}
	this.edges.splice(index,0,newEdge);//Agrego el nuevo elemento
	return true;
	
}

/**
* Devuelve los vertices adyacentes de un vertice del poligono
* @param {Vertex} vertex Vertex del cual quiero sus vertices adyacentes
* @returns {Array} Lista de vertices adyacentes
*/

Polygon.prototype.getAdjacentVertex = function(vertex){

	var index,v,edge;
	var result=[];
	for(var i = 0;i < this.edges.length;i++){
		edge = this.edges[i];
		if(edge.vertexO == vertex || edge.vertexD == vertex)
			edge.vertexO == vertex ? result.push(edge.vertexD):result.push(edge.vertexO);
	}
	return result;
}

/**
* Retorna una lista de vertices, pertenecientes a una lista de Edges
* @param {Array} Lista de Edges 
* @returns {Array} Lista de Vertex
*/

Polygon.prototype.getVertex = function(edges){
	
	var vertex=[];
	var v,edge;
	for(var i = 0;i < edges.length;i++){
		edge = edges[i];
		if(vertex.indexOf(edge.vertexO)==-1){
			vertex.push(edge.vertexO);
		}
		if(vertex.indexOf(edge.vertexD)==-1){
			vertex.push(edge.vertexD);
		}
		
	}
	return vertex;
}

/**
 * Devuelve el indice del edge al que pertenece vertex que se encuentra en el poligono 
 * origin demuestra si quiero el edge en donde vertex es el origen o no
 * @param {Vertex} vertex Vertex del cual quiero sus vertices adyacentes
 * @param {Bool} origin Demuestra si quiero el Edge en donde vertex es el origen o no
 * @returns {integer} Lista de vertices adyacentes
 */

Polygon.prototype.getIndexEdgeVertex = function(vertex,origin){
	var edge,index,v;
	for(var i = 0; i < vertex.edges.length; i++){
		edge = vertex.edges[i];
		
		index = this.edges.indexOf(edge);
		v = origin ? edge.vertexO : edge.vertexD; /* Se obtiene el indice de la arista del poligono la cual su vertice es de origen o destino (depende de origin)es vertex*/
		if(index>-1 && v == vertex)
			break;

	}
	return index;
}

/**
 * Devuelve el size de la lista de Edges
 * @returns {integer} Size de la lista
 */

Polygon.prototype.edgesSize = function(){
	return this.edges.length;
}







/*........................................Clase Triangle................................................................*/

function Triangle(v1,v2,v3,edges){
	//type = 0 T 2 arisas externas
	//type = 1 S 1 arista externa
	//type = 2 J 3 aristas internas
	//type = 3 Si es un fane triangle
	//type = 4 si es un triangulo generado por la espina
	//type = 5 si es un triangulo final
	this.v1 = v1;
	this.v2 = v2;
	this.v3 = v3;
	this.edges = edges;
	this.type = this.setType();
	this.vMidPoint = null;
}

/* Retorna el punto medio del triangulo*/
Triangle.prototype.getMidPoint=function(){
	var X = parseInt((this.v1.X+this.v2.X+this.v3.X)/3);
	var Y = parseInt((this.v1.Y+this.v2.Y+this.v3.Y)/3);
	if(this.vMidPoint ==null){
		this.vMidPoint = new Vertex(X,Y,0);
		return this.vMidPoint;
	}
	this.vMidPoint.X = X;
	this.vMidPoint.Y = Y;
	return this.vMidPoint;
}

/* Devuelve el vertice conectado a las 2 aristas externas del triangulo (solo si es type T)*/
Triangle.prototype.getExternalVertex=function(){
	if(this.type != 0)
		return false
	var externalEdges = this.getExternalEdges();
	if((externalEdges[0].vertexO == externalEdges[1].vertexO) || (externalEdges[0].vertexO == externalEdges[1].vertexD))
		return externalEdges[0].vertexO;
	if((externalEdges[0].vertexD == externalEdges[1].vertexO) || (externalEdges[0].vertexD == externalEdges[1].vertexD))
		return externalEdges[0].vertexD;
}

Triangle.prototype.getExternalEdges = function(){

	var edge;
	var externalEdges=[];
	for (var i = 0;i<this.edges.length;i++){
		edge = this.edges[i];
		if(edge.type==0)//SI es un edge externo
			externalEdges.push(edge);
	}
	return externalEdges;
}

Triangle.prototype.getInternalEdges = function(){

	var edge;
	var internalEdges=[];
	for (var i = 0;i<this.edges.length;i++){
		edge = this.edges[i];
		if(edge.type==1)//SI es un edge interno
			internalEdges.push(edge);
	}
	return internalEdges;
}

/* Devuelve los edges que no son Null*/
Triangle.prototype.getNotNullEdges = function(){

	var edge;
	var notNullEdges=[];
	for (var i = 0;i<this.edges.length;i++){
		edge = this.edges[i];
		if(edge!=null)//SI es no NULO
			notNullEdges.push(edge);
	}
	return notNullEdges;
}


/* DEfine el tipo de triangulo T ,S J
*/
Triangle.prototype.setType = function(){

	var edge;
	var externalEdges=0;
	for (var i = 0;i<this.edges.length;i++){
		edge = this.edges[i];
		if(edge.type == 5)
			return 5;
		if(edge.type == 4)
			return 4;
		if(edge.type==3)//Si es un fane edge
			return 3
		if(edge.type==0)//SI es un edge externo
			externalEdges++;
	}
	if(externalEdges==2)
		return 0;
	if(externalEdges==1)
		return 1;
	if(externalEdges==0)
		return 2;
}

/* DEvueleve el edge perteneciente a los vertices*/
Triangle.prototype.getEdge = function(v1,v2){
	var edge = null;
	for(var i = 0;i < this.edges.length;i++){
		edge = this.edges[i];
		if((edge.vertexO == v1 && edge.vertexD == v2)||(edge.vertexO == v2 && edge.vertexD == v1))
			return edge;
	}
	
}





/******************************************************Clase Spine**************************************************/

function Spine(vertex,edges,planeEdges){
  
	/* : es la lista de vertices de la espina, es decir, la lista de puntos de conexi ´ on. ´
		Esta informacion es redundante, ya que es contenida en el atributo edges, pero es ´
		una forma de agilizar calculos. ´
		Esta lista, es al igual que en el caso anterior, una lista de listas, ya que en cada
		posicion, se almacena una lista con los puntos de conexi ´ on de cada tri ´ angulo.
	*/
	this.vertex = vertex;
	/*es la lista de aristas de la espina, es decir, la lista de aristas que unen los
	  puntos de conexion de la espina dorsal. La estructura se almacenar ´ a como una ´
	  lista de listas, es decir, en cada posicion contendr ´ a una lista de aristas que se ´
	  correspondera con las aristas de la espina para cada tri ´ angulo.
	  */
	this.edges = edges;
	/* es la lista de aristas del plano que corta cada vertice de la espina ´
	   dorsal. Al igual que en los casos anteriores, es una lista de listas, y consigue en
       cada posicion, la lista de aristas relacionadas con los v ´ ertices de la misma posici ´ on´
       de la lista vertex.
	*/
	this.planeEdges = planeEdges;

	/* La espina es resultado de un triangulo S si:
	 * this.vertex = 2 , this.edges = 1 this.planeEdges =2
	 */

	 /* La espina es resultado de un triangulo J sin que ninguna arista haya sido eliminada si:
	 * this.vertex = 4 , this.edges = 3 this.planeEdges =3
	 */

	 /* La espina es resultado de un triangulo J si 1 arista fue eliminada si :
	 * this.vertex = 3 , this.edges = 2 this.planeEdges = 2
	 */

	 /* La espina es resultado de un triangulo J si 2 aristas fueron eliminadas si :
	 * this.vertex = 2 , this.edges = 1 this.planeEdges = 1
	 */
}

