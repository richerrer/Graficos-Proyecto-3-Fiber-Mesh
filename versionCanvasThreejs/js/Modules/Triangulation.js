function delaunay_triangulation_usingPoly2tri(points,value){

	var resamplePoints = Resample(points,value);
	
	var contour = [];
	
	/* Convierto los puntos en Poly2tripoints*/
	for(var i = 0; i < resamplePoints.length ; i++){
		var point = resamplePoints[i];
		var poly2triPoint = new poly2tri.Point(point.X,point.Y);
		contour.push(poly2triPoint);
	}

	var swctx = new poly2tri.SweepContext(contour);
	swctx.triangulate();

	/* Obtengo los triangulos delaunay*/
	var triangles = swctx.getTriangles();

	/* Transformo los triangulos */
	var mapVertex = generateVertex(triangles);
	var edges = generateEdges(triangles,mapVertex);
	var plane = generateTriangles(triangles,mapVertex,edges);
	return plane;
	//console.info("vertices ",mapVertex.size," edges",edges.length)
}

/* Genera los triangulos a partir de los triangulos de poly2tri*/
function generateTriangles(triangles,mapVertex,edges){
	var plane = [];//PLano de triangulos

	for(var i = 0; i < triangles.length ; i++){
		var triangle = triangles[i];

		var v0Poly2Tri = triangle.getPoint(0);
		var v1Poly2Tri = triangle.getPoint(1);
		var v2Poly2Tri = triangle.getPoint(2);

		var v0 = mapVertex.get(v0Poly2Tri);
		var v1 = mapVertex.get(v1Poly2Tri);
		var v2 = mapVertex.get(v2Poly2Tri);

		var e0 = getEdge(edges,v0,v1);
		var e1 = getEdge(edges,v1,v2);
		var e2 = getEdge(edges,v0,v2);

		plane.push(new Triangle(v0,v1,v2,[e0,e1,e2]));
	}

	return plane;
}

/* DEvueleve el edge perteneciente a los vertices*/
function getEdge(edges,v1,v2){
	var edge = null;
	for(var i = 0;i < edges.length;i++){
		edge = edges[i];
		if((edge.vertexO == v1 && edge.vertexD == v2)||(edge.vertexO == v2 && edge.vertexD == v1))
			return edge;
	}
	
}


/* Dado los triangulos generados por poly2tri, obtengo una lista de vertices Vertex de los triangulos* */
function generateVertex(triangles){
	var vertex = new Map();
	for(var i = 0; i < triangles.length ; i++){
		var triangle = triangles[i];

		for(var j = 0;j< triangle.getPoints().length;j++){
			var vPoly2Tri = triangle.getPoints()[j];
			if(!vertex.has(vPoly2Tri))
				vertex.set(vPoly2Tri,new Vertex(vPoly2Tri.x,vPoly2Tri.y,0));
		}
	}
	return vertex;
}

/* Dado los triangulos generados por poly2tri, obtengo una lista de edges de los triangulos*/
function generateEdges(triangles,mapVertex){

	var edges = [];

	for(var i = 0; i < triangles.length ; i++){
		var triangle = triangles[i];
		var v0Poly2Tri = triangle.getPoint(0);
		var v1Poly2Tri = triangle.getPoint(1);
		var v2Poly2Tri = triangle.getPoint(2);

		var v0 = mapVertex.get(v0Poly2Tri);
		var v1 = mapVertex.get(v1Poly2Tri);
		var v2 = mapVertex.get(v2Poly2Tri);

		if( ! existEdge(edges,v1,v2)){
			var type = triangle.getConstrainedEdgeAcross(v0Poly2Tri)?0:1;// Al edge v1 v2 se lo obtiene dandole el vertice opuesto y si es verdadero, entonces es externo
			var e0 = new Edge(v1,v2,type);// es el edge conformado por v1 y v2
			edges.push(e0);
		}
		if( ! existEdge(edges,v0,v2)){
			var type = triangle.getConstrainedEdgeAcross(v1Poly2Tri)?0:1;
			var e1 = new Edge(v0,v2,type);// es el edge conformado por v0 y v2
			edges.push(e1);
		}
		if( ! existEdge(edges,v0,v1)){
			var type = triangle.getConstrainedEdgeAcross(v2Poly2Tri)?0:1;
			var e2 = new Edge(v0,v1,type);// es el edge conformado por v0 y v1
			edges.push(e2);
		}
		
	}
	return edges;
}

/* Dada una lista de edges comprueba si ya existe un edge con 2 vertices dados*/
function existEdge(edges,v0,v1){
	for(var i = 0; i < edges.length ; i++){
		var edge = edges[i];
		if( (edge.vertexO == v0 && edge.vertexD == v1) ||(edge.vertexO == v1 && edge.vertexD == v0))
			return true;
	}
	return false;

}


function generateBasicTriangulation(polygon){
	var plano = [];
	basicTriangulation(polygon,plano);
	//delaunayTriangulation(plano);
	return plano;
}

function basicTriangulation(polygon,plano){

	var verticesConvexos,convexVertex,adjacentVertex,triangle,vInside,closeInnerVertex,polygonDivided;

	while(polygon.edgesSize() > 3){
		
		verticesConvexos = identificarVerticesConvexos(polygon);
		for(var i = 0;i < verticesConvexos.length;i++){

			/* Se ha separado el poligono*/
			if(polygon.vertex.length==0){
				break;
			}
			convexVertex = verticesConvexos[i];
			adjacentVertex = polygon.getAdjacentVertex(convexVertex);

			/*Si el poligono tiene menos de 3 vertices, puede darse porque se han formado todos 
			 * los triangulos con tan solo probar 1,2, o 3 vertices convexos
			 */
			if(adjacentVertex.length<2){
				break;
			}
			
			vInside = evaluateInnerEdge(convexVertex,adjacentVertex,polygon.vertex);
		
			/* Si no se intersecta con ningun punto se agrega el triangulo formado al plano*/
			if(vInside.length==0){
				var object = createTriangle(convexVertex,adjacentVertex[0],adjacentVertex[1],polygon);
				if(polygon.updateEdges(object.edges,object.edge)==true){//Actualizo el poligono removiendo edges y egrgegando el nuevo edge
					polygon.removeVertex(convexVertex)//Remuevo el convex vertex del poligono
					plano.push(object.triangle);
				}
			}
			else{
				closeInnerVertex = convexVertex.closeVertex(vInside);
				polygonDivided = dividePolygon(polygon,convexVertex,closeInnerVertex);	
				basicTriangulation(polygonDivided.polygon1,plano);
				basicTriangulation(polygonDivided.polygon2,plano);
				
			}

		}
	}
	if(polygon.vertex.length==3){
		var object = createTriangle(polygon.vertex[0],polygon.vertex[1],polygon.vertex[2],polygon);
		polygon.updateEdges(object.edges,object.edge);//Actualizo el poligono removiendo edges y egrgegando el nuevo edge
		polygon.removeVertex(polygon.vertex[0])//Remuevo el convex vertex del poligono
		plano.push(object.triangle);
	}
	//return plano;
}

/* EValua que se pueda construir una arista interna, es decir que esa arista no corte al poligono
 * Devuelve una lista de vertices con las cuales se corta el poligono, 
*/
function evaluateInnerEdge(convexVertex,adjacentVertex,vertexPolygon){

	 var vInside = [];//vertices dentro del triangulo a formar

	 //Area del triangulo a formar
	 var tArea = triangleArea(convexVertex,adjacentVertex[0],adjacentVertex[1]);
	 var v;
	 for (var i = 0; i< vertexPolygon.length ; i++){
	 	v = vertexPolygon[i];
	 	
	 	/* Se el punto a evaluar no pertenece al triangulo formado
	 	*/
	 	if(v != convexVertex && adjacentVertex.indexOf(v) == -1){
	 		
	 		/*	Si un punto del poligono esta dentro del triangulo formado, entonces intersecta al pogino y no se puede formar la arista
	 		*/
	 		if(isVertexInsideTriangle(convexVertex,adjacentVertex[0],adjacentVertex[1],v,tArea)==true)
	 			vInside.push(v);
	 	}
	 }
	 
	 return vInside;
}


function triangleArea(v1,v2,v3){
	var iX1 = v1.X;
	var iX2 = v2.X;
	var iX3 = v3.X;

	var iY1 = v1.Y;
	var iY2 = v2.Y;
	var iY3 = v3.Y;

	var area = Math.abs((iX2 * iY3+iX3 * iY1+iX1 *iY2-iY1 *iX2-iX1 *iY3-iY2 * iX3 ) / 2);
	return area;
}

function isVertexInsideTriangle(v1,v2,v3,v,area){

	var subTriangle1Area = triangleArea(v1,v2,v);
	var subTriangle2Area = triangleArea(v1,v3,v);
	var subTriangle3Area = triangleArea(v2,v3,v);

	var subTriangleAreaTotal = subTriangle1Area +subTriangle2Area+subTriangle3Area;

	if(subTriangleAreaTotal <= area)
		return true;
	return false;
}


function identificarVerticesConvexos(polygon){
	var vertices = polygon.vertex;
	var vertice,vXmin,vYmax,vYmin;

	var vXmax = vertices[0];
	var vXmin = vertices[0];
	var vYmax = vertices[0];
	var vYmin = vertices[0];
	for(var i = 1;i<vertices.length;i++){
		vertice = vertices[i];
		if(vertice.X > vXmax.X){vXmax = vertice;}
		if(vertice.X < vXmin.X){vXmin = vertice;}
		if(vertice.Y < vYmax.Y){vYmax = vertice;}
		if(vertice.Y > vYmin.Y){vYmin = vertice;}
	}

	//return [vYmax,vYmin,vXmax,vXmin];
	return [vXmax,vXmin,vYmax,vYmin];
}

/* Divide el poligono en 2 creando una arista desde convexVertex,closeVertex*/
function dividePolygon(polygon,convexVertex,closeVertex){
	var polygon1Edges=[];
	var polygon2Edges=[];
	var vertex1 = [];
	var vertex2 = [];
	var polygonEdges = polygon.edges;
	var edge,convexEdge;
	var edgeDivision = new Edge(closeVertex,convexVertex,1);
	var vertex;
	var adjacentVertex = polygon.getAdjacentVertex(convexVertex);
	var edgesFromVertex;
	//console.info("aquidd",adjacentVertex);
	if(adjacentVertex.length==2){

		/* Agrego los poligonos para la primera division*/
		vertex1.push(convexVertex);
		vertex = adjacentVertex[0];
		edge = polygon.getEdge(convexVertex,vertex);
		polygon1Edges.push(edge);
		while(vertex!=closeVertex){
			vertex1.push(vertex);
			edgesFromVertex = polygon.getEdgesFromVertex(vertex);
			for(var i = 0;i<edgesFromVertex.length;i++){
				var e = edgesFromVertex[i];
				if(e!=edge && polygon.edges.indexOf(e)>-1){
					edge = e;
					break;
				}
			}
			polygon1Edges.push(edge);
			vertex = edge.vertexD != vertex?edge.vertexD:edge.vertexO;
		}
		polygon1Edges.push(edgeDivision);
		vertex1.push(closeVertex);

		/* Agrego los poligonos para la segunda division*/
		vertex2.push(convexVertex);
		vertex = adjacentVertex[1];
		edge = polygon.getEdge(convexVertex,vertex);
		polygon2Edges.push(edge);
		while(vertex!=closeVertex){
			vertex2.push(vertex);
			edgesFromVertex = polygon.getEdgesFromVertex(vertex);
			for(var i = 0;i<edgesFromVertex.length;i++){
				var e = edgesFromVertex[i];
				if(e!=edge && polygon.edges.indexOf(e)>-1){
					edge = e;
					break;
				}
			}
			polygon2Edges.push(edge);
			vertex = edge.vertexD != vertex?edge.vertexD:edge.vertexO;
		}
		polygon2Edges.push(edgeDivision);
		vertex2.push(closeVertex);
	}
	/* Se eleiminan todas las aristas del poligono anterior*/
	polygon.edges = [];
	polygon.vertex = [];
	return { polygon1 : new Polygon(vertex1,polygon1Edges),polygon2:new Polygon(vertex2,polygon2Edges)};
}

/* Retorna la arista creada del tirangulo, las aristas que ya se encontraban en el poligono y el tirangulo*/
function createTriangle(v1,v2,v3,polygon){
	var newEdge;var vertex = [v1,v2,v3,v1];var edge;var vertex1,vertx2;
	var oldEdges=[];
	var triangleEdges = [];
	for(var i = 1;i <vertex.length;i++){
		vertex1 = vertex[i-1];
		vertex2 = vertex[i];

		edge = polygon.getEdge(vertex1,vertex2);
		if(edge!=null){
			oldEdges.push(edge);
			triangleEdges.push(edge);
		}
		else{
			newEdge = new Edge(vertex1,vertex2,1);
			triangleEdges.push(newEdge);
		}
	}
	var mytriangle = new Triangle(v1,v2,v3,triangleEdges);
	return {triangle:mytriangle,edges:oldEdges,edge:newEdge};

}

function delaunayTriangulation(basicTriangles){
	for (var i = 0; i < basicTriangles.length; i++){//2 3 6 7
		var change = true;
		var triangle = basicTriangles[i];
		//if(triangle.type == 0)
		//	continue
		/* Mientras no compruebe que todos los triangulos comunes a un edge sean legales*/
		//triangle.draw(triangle,canvas_context);
		while(change){
			var commonTriangles = getTrianglesWithCommonEdge(triangle,basicTriangles);
			//console.info(" triangulo ",i," tiene ",commonTriangles.length)
			for(var j = 0; j < commonTriangles.length; j++){
				var commonTriangle = commonTriangles[j].commonT;
				var commonEdge = commonTriangles[j].commonE;
				//commonTriangle.draw3(canvas_context);

				/* Proceso para comprobar si se realiza un flip de la arista */
				var v1,v4;
				var v2 = commonEdge.vertexO;
				var v3 = commonEdge.vertexD;
				if(triangle.v1 != v2 && triangle.v1 != v3)
					v1 = triangle.v1;
				else if(triangle.v2 != v2 && triangle.v2 != v3) 
					v1 = triangle.v2;
				else if(triangle.v3 != v2 && triangle.v3 != v3) 
					v1 = triangle.v3;

				if(commonTriangle.v1 != v2 && commonTriangle.v1 != v3)
					v4 = commonTriangle.v1;
				else if(commonTriangle.v2 != v2 && commonTriangle.v2 != v3) 
					v4 = commonTriangle.v2;
				else if(commonTriangle.v3 != v2 && commonTriangle.v3 != v3) 
					v4 = commonTriangle.v3;
		

				var e1_2 = triangle.getEdge(v1,v2);
				var e1_3 = triangle.getEdge(v1,v3);
				var e4_2 = commonTriangle.getEdge(v4,v2);
				var e4_3 = commonTriangle.getEdge(v4,v3);

				var anglesT1 = getAnglesByVertex(v1,v2,v3);
				var anglesT2 = getAnglesByVertex(v4,v2,v3);
				var anglesT1New = getAnglesByVertex(v1,v2,v4);
				var anglesT2New = getAnglesByVertex(v1,v3,v4);

				var a1 = anglesT1[0];
				var b1 = anglesT1[1];
				var c1 = anglesT1[2];

				var a2 = anglesT2[0];
				var b2 = anglesT2[1];
				var c2 = anglesT2[2];

				var a11 = anglesT1New[0];
				var b11 = anglesT1New[1];
				var c11 = anglesT1New[2];

				var a22 = anglesT2New[0];
				var b22 = anglesT2New[1];
				var c22 = anglesT2New[2];

				/* Si algun angulo es 0*/
				if(a1 == 0 || b1 == 0 || c1 == 0 || a2 == 0 || b2 == 0 || c2 == 0|| a11 == 0 ||b11 == 0||c11 == 0|| a22 == 0 ||b22 == 0||c22 == 0)
					continue


				if( ((min(a1,b1,c1)< min(a11,b11,c11)) || (min(a2,b2,c2) < min(a22,b22,c22))) )
				{console.info("vno Legales")
					var newEdge = new Edge(v1,v4,1);
					triangle.v1 = v1;
					triangle.v2 = v2;
					triangle.v3 = v4;

					var edgesTriangle = [e1_2,e4_2,newEdge];
					triangle.edges = edgesTriangle;
					triangle.type = triangle.setType();

					//triangle.draw3(canvas_context)
					commonTriangle.v1 = v1;
					commonTriangle.v2 = v3;
					commonTriangle.v3 = v4;

					var edgesCommonTriangle = [e1_3,e4_3,newEdge];
					commonTriangle.edges = edgesCommonTriangle;
					commonTriangle.type = commonTriangle.setType();
					/*var index = commonTriangle.edges.indexOf(commonEdge);
					commonTriangle.edges.splice(index,1);//Remuevo el edge
					commonTriangle.edges.push(newEdge);
					commonTriangle.type = commonTriangle.setType();*/
					//commonTriangle.draw3(canvas_context)
					break;//Rompo el lazo para volver a obtener los nuevos triangulos comunes
				}
				
			}	
			
			change = false;//Todos los triangulos comunes fueron legales
		}
	}
}

/* Devuelve el primer triangulo */
function getTrianglesWithCommonEdge(triangle,triangles){
	var commonTriangles = [];
	var edge1 = triangle.edges[0];
	var edge2 = triangle.edges[1];
	var edge3 = triangle.edges[2];
	var flag = 0;
	for (var i = 0; i < triangles.length;i++){
		if(flag == 3)//Solo pueden existir 3 triangulos como maximo
			break;
		var commonTriangle = triangles[i];
		if(commonTriangle == triangle)
			continue;
		if(commonTriangle.edges.indexOf(edge1)!=-1){
			flag++;
			commonTriangles.push({commonT: commonTriangle, commonE:edge1 });
		}
		else if(commonTriangle.edges.indexOf(edge2)!=-1){
			flag++;
			commonTriangles.push({commonT: commonTriangle, commonE:edge2 });
		}
		else if(commonTriangle.edges.indexOf(edge3)!=-1){
			flag++;
			commonTriangles.push({commonT: commonTriangle, commonE:edge3 });
		}

	}

	return commonTriangles;
}

function getAnglesByVertex(v1,v2,v3){
	var a = parseInt(v1.distance(v2));
	var b = parseInt(v1.distance(v3));
	var c = parseInt(v2.distance(v3));

	/*var alpha = Math.asin((a/c)*M
	ath.sin(gama));
	var beta = Math.asin((b/c)*Math.sin(gama));*/

	var value = ((a*a)+(b*b)-(c*c))/(2*a*b);
	if(value>1)
		value = 1;
	if(value<-1)
		value = -1;
	//console.info(value)
	var gama = Math.acos(value);
	
	var value =((c*c)+(b*b)-(a*a))/(2*b*c);
	if(value>1)
		value = 1;
	if(value<-1)
		value = -1;
	//console.info(value)
	var alpha = Math.acos(value);

	var value =((a*a)+(c*c)-(b*b))/(2*a*c);
	if(value>1)
		value = 1;
	if(value<-1)
		value = -1;
	var beta = Math.acos(value);
	//if (gama == null)
	//console.info(alpha,beta,gama)
	return [alpha,beta,gama];
}

function min(value1,value2,value3){
	if(value1 <= value2 && value1 <= value3)
		return value1;
	if(value2 <= value1 && value2 <= value3)
		return value2;
	if(value3 <= value2 && value3 <= value1)
		return value3;
}