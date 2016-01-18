function myResamplePoints(puntos,value){
	
	var resamplePoints = Resample(puntos,value);
	console.info('puntos originales', puntos.length);	
	console.info('puntos remuestreados', resamplePoints.length);	
	
	//repaint(resamplePoints);

	var newResamplePoints = [];
	var vertices = [];
	for(var i = 0; i < resamplePoints.length ; i++){
		var point = resamplePoints[i];
		var v = new Vertex(point.X,point.Y,0);
		vertices.push(v);
	}

	for(var i = 1; i < vertices.length ; i++){
		var v1 = vertices[i-1];
		var v2 = vertices[i];
		var edge = new Edge(v1,v2,0);
		newResamplePoints.push(edge);
	}
	var v1 = vertices[vertices.length-1];
	var v2 = vertices[0];
	var edge = new Edge(v1,v2,0);
	newResamplePoints.push(edge);

	return {vertex:vertices,edges:newResamplePoints};
}