/*************************************MOdulo 3**********************************************/

function pruning(plano){

	var T_triangles = get_T_triangles(plano);//Triangulos externos (tipo t)
	var triangle;
	var joinVertex = [];                     //Vertices que se uniran 
	var mergeTriangles = [];                 //Triangulos a desaparecer por cada iteracion
	var edgeComprove;                       //EDge del cual se formara el radio
	var result=[];
	var oldEdges = [];                      //EDges que ya han sido divididos
	var edgeBefore;
	var newTriangles = [];
	var resultMerge = [];                      //Triangulos a desaparecer finales

	//console.info("Triangulos interno",T_triangles.length);
	for(var i = 0; i< T_triangles.length;i++){
		mergeTriangles = [];
		triangle = T_triangles[i];
		joinVertex = [];
		edgeComprove = triangle.getInternalEdges()[0];//Como es un triangulo tipo T solo deberia tener un Edge interno
		
		while(1){
			//Compruebo que el nuevo edge no haya sido dividido 
			if(oldEdges.indexOf(edgeComprove)>-1){
				var midPoint = edgeBefore.getMidPoint();
				var triangles1Form = generateNewTrianglesForm(edgeBefore,midPoint,joinVertex,mergeTriangles);
				newTriangles = newTriangles.concat(triangles1Form);

				break;
			}

			addWithoutRepeat(joinVertex,[triangle.v1,triangle.v2,triangle.v3]);//Agrego los vertices del triangulo
			mergeTriangles.push(triangle);
			result.push(triangle);


			var J_triangle = get_J_triangle_by_edge(edgeComprove,plano);
			//SI edgeComprove pertenece a un triangulo tipo J
			if(J_triangle!=null){
				
				var midPoint = J_triangle.getMidPoint();
				var triangles1Form = generateNewTrianglesForm(edgeComprove,midPoint,joinVertex,mergeTriangles);
				newTriangles = newTriangles.concat(triangles1Form);
				/* Remuevo el edgeComprove del triangulo J*/
				removeEdge_To_J_triangle(J_triangle,edgeComprove);
				
				break;//rompe el while
			}
			var growing = it_can_grow(edgeComprove,joinVertex);//Verifica si todos los joinVertex estan dentro del circulo con diametro dado por edgeComprove
			triangle = getAdjacentTriangle(triangle,plano,edgeComprove);//Obtengo el triangulo adyacente por un edge
			/* Si no es verdadero dejo de crecer*/
			if(!growing||triangle.type==0){

				/* Creo los nuevos edges*/
				var midPoint = edgeComprove.getMidPoint();
				var triangles1Form = generateNewTrianglesForm(edgeComprove,midPoint,joinVertex,mergeTriangles);
				newTriangles = newTriangles.concat(triangles1Form);
				break;
			}
			oldEdges.push(edgeComprove);
			edgeBefore = edgeComprove;
			edgeComprove = getNewComproveEdge(triangle,edgeComprove);//Obtengo el nuevo edge diametro
		}
		resultMerge = resultMerge.concat(mergeTriangles);

	}
	//console.info("Triangulos resultantes",newTriangles.length);

	//Remuevo los triangulos a los cuales se les hizo el merge
	removeTriangles(plano,resultMerge);

	//Agrego los nuevos triangulos 
	plano = plano.concat(newTriangles);

	return plano;
	

}

/* Elimina una lista de triangulos de un plano */
function removeTriangles(plano,triangles){
	for (var i = 0; i < triangles.length;i++){
		var triangle = triangles[i];
		var index = plano.indexOf(triangle);
		if(index >= -1)
			plano.splice(index,1);

	}
}

function getMidPoint(v1,v2){
	var newVertex = new Vertex((v1.X+v2.X)/2,(v1.Y+v2.Y)/2,0);
	return newVertex;
}

/* Verifica si el triangulo puede crecer*/
function it_can_grow(edge,joinVertex){
	var midPoint = getMidPoint(edge.vertexO,edge.vertexD);
	var radio = edge.vertexO.distance(edge.vertexD)/2;
	for (var i = 0; i< joinVertex.length; i++){
		vertex = joinVertex[i];
		if(!is_point_inside_the_circle(midPoint,radio,vertex))
			return false;
	}
	return true;
}

function is_point_inside_the_circle(midPoint,radio,point){

	var xCentro = parseInt(midPoint.X);
	var yCentro = parseInt(midPoint.Y);
	var xPoint = parseInt(point.X);
	var yPoint = parseInt(point.Y);
	var value = Math.sqrt(Math.pow(xCentro - xPoint,2) + Math.pow(yCentro - yPoint,2));

	//radio = radio.toFixed();
	//value = value.toFixed();
	if(value <= radio+1){
		return true;
	}else{
	//console.info("este punto no esta",point, "porque radio es",radio," y la distancia fue",value,"centro",midPoint);

	return false;}

}
/* Dado  un triangulo, retorna el triangulo que comparte el edge enviado por parametro*/
function getAdjacentTriangle(triangle,plano,edge){

	for(var i = 0; i< plano.length;i++){
		var t = plano[i];
		if( t != triangle && t.edges.indexOf(edge)>-1 && triangle.edges.indexOf(edge)>-1){
			return t;
		}
	}
	return null;
}
/* Retorna los triangulos tipo T*/
function get_T_triangles(plano){
	var T_triangles = [];
	var triangle;

	for(var i = 0; i< plano.length;i++){
		triangle = plano[i];
		if(triangle.type == 0)
			T_triangles.push(triangle);
	}
	return T_triangles;
}

/* Retorna el triangulo tipo J al que pertenece el edge*/
function get_J_triangle_by_edge(edge,plano){
	for(var i = 0; i< plano.length;i++){
		var t = plano[i];
		if( t.type ==2 && t.edges.indexOf(edge)>-1)
			return t;
	}
	return null;
}

/* Remueve un edge especifico de un triangulo tipo J */
function removeEdge_To_J_triangle(triangle,edge){
	if(triangle.type!=2){
		return false;
	}
	var index = triangle.edges.indexOf(edge);
	if(index!=-1){
		triangle.edges[index] = null;
		return true;
	}
	return false;
}

/* Dado un triangulo y un edge, devuelve el edge de ese triangulo que no sea el edge enviado por parametro y que sea un edge interno*/
function getNewComproveEdge(triangle,edge){
	//triangle.draw2(canvas_context,"rgb(0,0,0)","1");
	for(var i = 0; i < triangle.edges.length ;i++){
		var e = triangle.edges[i];
		if( e != edge && e.type ==1 )//
			return e;
	}
	
	
	//edge.draw(canvas_context,"rgb(0,0,255)","5");
	return null;
}

/* Agrega nuevos vertices a la lista pero comprueba que no se repitan*/
function addWithoutRepeat(list,values){
	for(var i = 0; i< values.length;i++){
		var e = values[i];
		if( list.indexOf(e)==-1)//si no se encuentra
			list.push(e);
	}
}

/* Dada una lista de edges devuelve el edge que contenga a vertex, si mas de uno lo tienen se devuelve el primero*/
function getEdgeVertex(edges,vertex){
	for(var i = 0;i<edges.length;i++){
		var e = edges[i];
		if(e.vertexO==vertex || e.vertexD==vertex)
			return e;
	}
}

/* Genera los nuevos triangulos despues de la poda, cuando crecieron mientras los nuevos vertices no se encontraban dentro de la circunferencia (Tipo 0)
 * O s fue un triangulo J
 * oldEdge es el edge que sera divido por la mitad para formar los 2 nuevos edges
 * joinvertex son los vertices externaos que formaran los nuevos triangulos
 * mergeTriangles son los triangulos ha los cuales se les va a aplicar el merge
 * Mid point es el punto medio desde donde se generaran los edges y los triangulos
 *
 */
function generateNewTrianglesForm(oldEdge,midPoint,joinVertex,mergeTriangles){
	/* Creo los nuevos edges*/
	var newEdges = [];
	var newTriangles = [];
	for(var j = 0;j<joinVertex.length;j++){
		var newEdge = new Edge(midPoint,joinVertex[j],3);
		newEdges.push(newEdge);
		//newEdge.draw(canvas_context,"rgb(0,255,255)","5");					
	}

	for(var j = 0;j<mergeTriangles.length;j++){
		var t = mergeTriangles[j];
		var externalEdges = t.getExternalEdges();

		for(var k =0;k<externalEdges.length;k++){
			var vertex1 = externalEdges[k].vertexO;
			var vertex2 = externalEdges[k].vertexD;

			var edge1 = getEdgeVertex(newEdges,vertex1);
			var edge2 = getEdgeVertex(newEdges,vertex2);

			if(edge1!=null && edge2 != null){
				var newTriangle = new Triangle(midPoint,vertex1,vertex2,[externalEdges[k],edge1,edge2]);
				//newTriangle.draw3(canvas_context);
				newTriangles.push(newTriangle);
			}

		}
	}

	return newTriangles;
}