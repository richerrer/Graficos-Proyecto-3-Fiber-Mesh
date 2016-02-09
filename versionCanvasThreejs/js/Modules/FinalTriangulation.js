function finalTriangulation(plano,spine){
	var vertexDividedForST = getSubDividedPointsSpineForSTriangle(spine);
	
	for(var i = 0; i< spine.edges.length;i++){

		/* La espina es resultado de un triangulo J si 2 aristas fueron eliminadas si :
	 	 * this.vertex = 2 , this.edges = 1 this.planeEdges = 1
	 	 * Como resultado se forman 2 triangulos
	 	 */
		if(spine.vertex[i].length == 2 && spine.edges[i].length==1 && spine.planeEdges[i].length == 1){
			var edges = spine.edges[i];
			var vertex = spine.vertex[i];
			var planeEdges = spine.planeEdges[i];

			newTfromJTriangle2EdgeRemove(edges,vertex,planeEdges,plano);
		}

		/* La espina es resultado de un triangulo J si 1 arista fue eliminada si :
	 	 * this.vertex = 3 , this.edges = 2 this.planeEdges = 2
	 	 * Como resultado se forman 4 triangulos
	 	 */
		else if(spine.vertex[i].length == 3 && spine.edges[i].length==2 && spine.planeEdges[i].length == 2){
			var edges = spine.edges[i];
			var vertex = spine.vertex[i];
			var planeEdges = spine.planeEdges[i];

			newTfromJTriangle1EdgeRemove(edges,vertex,planeEdges,plano);
			
		}

		/* La espina es resultado de un triangulo J si 0 aristas fue eliminada si :
	 	 * this.vertex = 4 , this.edges = 3 this.planeEdges = 3
	 	 * Como resultado se forman 4 triangulos
	 	 */
		else if(spine.vertex[i].length == 4 && spine.edges[i].length== 3 && spine.planeEdges[i].length == 3){
			var edges = spine.edges[i];
			var vertex = spine.vertex[i];
			var planeEdges = spine.planeEdges[i];

			newTfromJTriangle0EdgeRemove(edges,vertex,planeEdges,plano);
			
		}

		/* La espina es resultado de un triangulo S si:
	 	 * this.vertex = 2 , this.edges = 1 this.planeEdges =2
	 	 * Como resultado se forman 3 triangulos
	 	 */
		else if( spine.vertex[i].length == 2 && spine.edges[i].length==1 && spine.planeEdges[i].length == 2){
			var edges = spine.edges[i];
			var vertex = spine.vertex[i];
			var planeEdges = spine.planeEdges[i];

			//newTfromSTriangle(edges,vertex,planeEdges,plano);
			newTfromSTriangle2(edges,vertex,planeEdges,plano,vertexDividedForST);
			
		}
	}

}

/* Obtengo los puntos de la espina para la correcta subdivision de los triangulos S */
function getSubDividedPointsSpineForSTriangle(spine){
	
	var vertexDividedForST = [];//Vertices de la espina que seran la subdivision
	var visited = [];// vertices de la espina visitados
	
	for(var i = 0; i< spine.edges.length;i++){

		/* La espina es resultado de un triangulo S si:
	 	 * this.vertex = 2 , this.edges = 1 this.planeEdges =2
	 	 * Como resultado se forman 3 triangulos
	 	 */
		if( spine.vertex[i].length == 2 && spine.edges[i].length==1 && spine.planeEdges[i].length == 2){
			var edges = spine.edges[i];
			var vertex = spine.vertex[i];
			var planeEdges = spine.planeEdges[i];

			//newTfromSTriangle(edges,vertex,planeEdges,plano);
			var vMidPlaneEdge1 = planeEdges[0].getMidPoint();
			var vMidPlaneEdge2 = planeEdges[1].getMidPoint();
			if(vertexDividedForST.indexOf(vMidPlaneEdge1) == -1 && vertexDividedForST.indexOf(vMidPlaneEdge2) == -1)
			{
				if(visited.indexOf(vertex[1]) == -1 ){
					vertexDividedForST.push(vertex[1]);
					visited.push(vertex[1]);
					visited.push(vertex[0]);
				}
				else{
					vertexDividedForST.push(vertex[0]);
					visited.push(vertex[1]);
					visited.push(vertex[0]);
				}
				//console.info("no esta")
			}
			else{
				visited.push(vertex[1]);
				visited.push(vertex[0]);
				//console.info("si esta")
			}

		}
	}
	return vertexDividedForST;
}

/* Retorna los nuevos triangulos producto de la espina y triangulos tipo J si 2  aristas fueeron removidas*/
function newTfromJTriangle2EdgeRemove(edges,vertex,planeEdges,plano){
	
	var e = edges[0];
	var v1 = vertex[0];
	var v2 = vertex[1];
	var planeEdge = planeEdges[0];

	var e1 = new Edge(v2,planeEdge.vertexO,4);
	var e2 = new Edge(v1,planeEdge.vertexO,4);
	var e3 = new Edge(v2,planeEdge.vertexD,4);
	var e4 = new Edge(v1,planeEdge.vertexD,4);


	var triangle = new Triangle(planeEdge.vertexO,v1,v2,[e1,e2,e]);
	//triangle.draw(triangle,canvas_context);
	plano.push(triangle);
			
	var triangle = new Triangle(planeEdge.vertexD,v1,v2,[e3,e4,e]);
	//triangle.draw(triangle,canvas_context);
	plano.push(triangle);

	removeTriangleByMidPoint(plano,v1,v2);
}

/* Retorna los nuevos triangulos producto de la espina y triangulos tipo J si 0  aristas fueeron removidas*/
function newTfromJTriangle0EdgeRemove(edges,vertex,planeEdges,plano){
	
	var e1 = edges[0];
	var e2 = edges[1];
	var e3 = edges[2];
	var planeEdge1 = planeEdges[0];
	var planeEdge2 = planeEdges[1];
	var planeEdge3 = planeEdges[2];
	var vertexCommon = getVertexInCommon(e1,e2);

	var vc = vertexCommon[0];
	var v1 = planeEdge1.vMidPoint;
	var v2 = planeEdge2.vMidPoint;
	var v3 = planeEdge3.vMidPoint;
	var v4 = getVertexInCommon(planeEdge1,planeEdge2)[0];
	var v5 = getVertexInCommon(planeEdge2,planeEdge3)[0];
	var v6 = getVertexInCommon(planeEdge3,planeEdge1)[0];

	var e4 = new Edge(vc,v4,4);
	var e5 = new Edge(v1,v4,4);
	if(v1 == e1.vertexO || v1 == e1.vertexD)
		var er1 = e1;
	else if(v1 == e2.vertexO || v1 == e2.vertexD)
		var er1 = e2;
	else if(v1 == e3.vertexO || v1 == e3.vertexD)
		var er1 = e3;

	var triangle = new Triangle(v1,vc,v4,[e3,e4,er1]);
	//triangle.draw3(canvas_context);
	plano.push(triangle);

	var e6 = new Edge(v2,v4,4);
	if(v2 == e1.vertexO || v2 == e1.vertexD)
		var er2 = e1;
	else if(v2 == e2.vertexO || v2 == e2.vertexD)
		var er2 = e2;
	else if(v2 == e3.vertexO || v2 == e3.vertexD)
		var er2 = e3;

	var triangle = new Triangle(v2,vc,v4,[e6,e4,er2]);
	//triangle.draw3(canvas_context);
	plano.push(triangle);


	var e7 = new Edge(v2,v5,4);
	var e8 = new Edge(vc,v5,4);

	var triangle = new Triangle(v2,vc,v5,[e7,e8,er2]);
	//triangle.draw3(canvas_context);
	plano.push(triangle);

	var e9 = new Edge(v3,v5,4);
	if(v3 == e1.vertexO || v3 == e1.vertexD)
		var er3 = e1;
	else if(v3 == e2.vertexO || v3 == e2.vertexD)
		var er3 = e2;
	else if(v3 == e3.vertexO || v3 == e3.vertexD)
		var er3 = e3;

	var triangle = new Triangle(v3,vc,v5,[e9,e8,er3]);
	//triangle.draw3(canvas_context);
	plano.push(triangle);

	var e10 = new Edge(v3,v6,4);
	var e11 = new Edge(vc,v6,4);

	var triangle = new Triangle(v3,vc,v6,[e10,e11,er3]);
	//triangle.draw3(canvas_context);
	plano.push(triangle);
	
	var e12 = new Edge(v1,v6,4);
	var triangle = new Triangle(v1,vc,v6,[e12,e11,er1]);
	//triangle.draw3(canvas_context);
	plano.push(triangle);

	removeTriangleByEdges(plano,planeEdge1,planeEdge2);
}



/* Retorna los nuevos triangulos producto de la espina y triangulos tipo J si una arista fue removida*/
function newTfromJTriangle1EdgeRemove(edges,vertex,planeEdges,plano){
	var e1 = edges[0];
	var e2 = edges[1];
	var planeEdge1 = planeEdges[0];
	var planeEdge2 = planeEdges[1];

	var vertexCommon = getVertexInCommon(e1,e2);
	var vertexCommon2 = getVertexInCommon(planeEdge1,planeEdge2);
	var v1 = vertexCommon[0];
	var v4 = vertexCommon2[0];
	var v2 = planeEdge1.vMidPoint;
	var v5 = planeEdge1.vertexO != v4 ? planeEdge1.vertexO:planeEdge1.vertexD ;
	var v3 = planeEdge2.vMidPoint;
	var v6 = planeEdge2.vertexO != v4 ? planeEdge2.vertexO:planeEdge2.vertexD ;

	var e3 = new Edge(v2,v4,4);
	var e4 = new Edge(v1,v4,4);
	var er1 = (e1.vertexO==v1 || e1.vertexO == v2) && (e1.vertexD==v1 || e1.vertexD == v2)?e1:e2;
	var e6 = new Edge(v2,v5,4);
	var e7 = new Edge(v1,v5,4);
	var e5 = new Edge(v4,v3,4);
	var er2 = (e1.vertexO==v1 || e1.vertexO == v3) && (e1.vertexD==v1 || e1.vertexD == v3)?e1:e2;
	var e8 = new Edge(v3,v6,4);
	var e9 = new Edge(v1,v6,4);

	var triangle = new Triangle(v1,v2,v4,[e3,e4,er1]);
	plano.push(triangle);
			
	var triangle = new Triangle(v1,v2,v5,[e6,e7,er1]);
	plano.push(triangle);
			
	var triangle = new Triangle(v1,v3,v4,[e5,e4,er2]);
	plano.push(triangle);

	var triangle = new Triangle(v1,v3,v6,[e8,e9,er2]);
	plano.push(triangle);

	removeTriangleByEdges(plano,planeEdge1,planeEdge2);

}

/* Dado 2 vertices que pertenecen a la espina, devuelve el vertice que dividira el triangulo */
function getDividedVertex(spineVertexDivided,v1,v2){
	if(spineVertexDivided.indexOf(v1)!=-1)
		return v1;
	else if(spineVertexDivided.indexOf(v2)!=-1)
		return v2;
	else{
		console.info(" Error en getDividedVertex, ninguno de los vertices pertenece a los puntos de subdivision")
	}
}

/* Retorna los nuevos triangulos producto de la espina y triangulos tipo S*/
function newTfromSTriangle2(edges,vertex,planeEdges,plano,spineVertexDivided){
	

	var e = edges[0];
	var v1 = getDividedVertex(spineVertexDivided,vertex[0],vertex[1]);
	var v2 = vertex[0] == v1 ? vertex[1]:vertex[0];

	var vMidPlaneEdge1 = planeEdges[0].getMidPoint();
	var vMidPlaneEdge2 = planeEdges[1].getMidPoint();
	/* Obtengo los vertices de los planeEdges en donde el primer
	 * vertice es el vertice comun de los 2 edges
	 */
	var planeEdgeSubdivisionPoint = planeEdges[0].getMidPoint() == v1 ? planeEdges[0]:planeEdges[1];
	var vertex = getVertexInCommon(planeEdges[0],planeEdges[1]);
	var vc = vertex[0];
	var vc1 = planeEdgeSubdivisionPoint.vertexO != vc ? planeEdgeSubdivisionPoint.vertexO : planeEdgeSubdivisionPoint.vertexD;
	var vc2 = vertex[1] != vc1 ? vertex[1]:vertex[2];

	var e1 = new Edge(vc,v1,4);
	var e2 = new Edge(vc,v2,4);
	var e3 = new Edge(v1,vc1,4);
	var e4 = new Edge(v2,vc2,4);
	var e5 = new Edge(v1,vc2,4);
	var e6 = new Edge(vc1,vc2,4);
	

	var triangle = new Triangle(vc,v1,v2,[e1,e2,e]);
	//triangle.draw(triangle,canvas_context);
	plano.push(triangle);

	var triangle = new Triangle(v1,v2,vc2,[e,e4,e5]);
	//triangle.draw(triangle,canvas_context);
	plano.push(triangle);

	var triangle = new Triangle(v1,vc1,vc2,[e3,e6,e5]);
	//triangle.draw(triangle,canvas_context);
	plano.push(triangle);

	removeTriangleByEdges(plano,planeEdges[0],planeEdges[1]);
}


/* Retorna los nuevos triangulos producto de la espina y triangulos tipo S*/
function newTfromSTriangle(edges,vertex,planeEdges,plano){
	

	var e = edges[0];
	var v1 = vertex[0];
	var v2 = vertex[1];
			
	/* Obtengo los vertices de los planeEdges en donde el primer
	 * vertice es el vertice comun de los 2 edges
	 */
	var vertex = getVertexInCommon(planeEdges[0],planeEdges[1]);
	var e1 = new Edge(vertex[0],v1,4);
	var e2 = new Edge(vertex[0],v2,4);
	var e3 = new Edge(v2,vertex[2],4);
	var e4 = new Edge(vertex[1],vertex[2],4);
	var e5 = new Edge(v2,vertex[1],4);
	var e6 = new Edge(v1,vertex[1],4);

	var triangle = new Triangle(vertex[0],v1,v2,[e1,e2,e]);
	//triangle.draw(triangle,canvas_context);
	plano.push(triangle);

	var triangle = new Triangle(vertex[1],v1,v2,[e5,e6,e]);
	//triangle.draw(triangle,canvas_context);
	plano.push(triangle);

	var triangle = new Triangle(vertex[1],vertex[2],v2,[e5,e3,e4]);
	//triangle.draw(triangle,canvas_context);
	plano.push(triangle);

	removeTriangleByEdges(plano,planeEdges[0],planeEdges[1]);
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

/* Remueve un triangulo dado los 2 edges */
function removeTriangleByEdges(plano,edge1,edge2){
	var i;
	//console.info(" al principio",plano.length);
	for(i = 0; i < plano.length ; i ++){
		var triangle = plano[i];
		var index1 = triangle.edges.indexOf(edge1);
		var index2 = triangle.edges.indexOf(edge2);

		if(index1 != -1 && index2 != -1){
			plano.splice(i,1);
			break;
		}
	}
	//console.info(" al final",plano.length);
}

/* Dado un triangulo y dado 2 posibles puntos medios, remueve el triangulo 
* con punto medio igual a midPoint1 o midPoint2
*/
function removeTriangleByMidPoint(plano,midPoint1,midPoint2){
	var i;
	//console.info(" al principio",plano.length);
	for(i = 0; i < plano.length ; i ++){
		var triangle = plano[i];

		if(triangle.vMidPoint == midPoint1 ||triangle.vMidPoint == midPoint2 ){
			//triangle.draw3(canvas_context);
			plano.splice(i,1);
			break;
		}
	}
}
