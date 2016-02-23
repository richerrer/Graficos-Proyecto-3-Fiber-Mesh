
function extrussion(baseRing,baseRingObjThreejs,extrussionStroke,cameraPoint,malla,escena,color){

	/* Get the base ring points applying the matrix transform */
	var baseRingApplyTransform = baseRing.map(function(point){
		return applyMatrixTransform(baseRingObjThreejs,[point[0],point[1],point[2]]);
	});
	/* The center point of the base ring */
	var center = getGravityCenter(baseRing);
	/* The normal vector of the base ring */
	var ringNormal = getBaseRingNormal(baseRing,center);
	ringNormal = applyMatrixTransform(baseRingObjThreejs,ringNormal);
	/* Vector to compute the plane projection */
	var vector = rotateVector(ringNormal,90);

	center = applyMatrixTransform(baseRingObjThreejs,center);
	
	/* Get the plane for the projection and the proejected points of the extrussion */
	var strokePlane = getProjectionPoints(extrussionStroke,ringNormal,center,vector,cameraPoint);
	var normalStrokePlaneEcuation = [strokePlane.planeEcuation.A,strokePlane.planeEcuation.B,strokePlane.planeEcuation.C];
	var projectedPoints = strokePlane.projectedPoints;
	var rings = generateCopyRings(projectedPoints,normalStrokePlaneEcuation,center,baseRingApplyTransform);
	var object3Dextrussion = sweepRings(rings.copyRings,rings.lastPoint,malla,escena,color);
	return object3Dextrussion;
}

/* Get the gravity point of the center */
function getGravityCenter(baseRing){

	var cX = 0;
	var cY = 0;
	var cZ = 0;
	baseRing.forEach(function(point,index,array){
		cX = cX + point[0];
		cY = cY + point[1];
		cZ = cZ + point[2];
	});

	return [cX/baseRing.length,cY/baseRing.length,cZ/baseRing.length];
}

/* Get the normal of the base Ring */
function getBaseRingNormal(baseRing,center){
	var v1 = new THREE.Vector3( baseRing[0][0] - center[0], baseRing[0][1]-center[1], baseRing[0][2]-center[2] );
	var v2 = new THREE.Vector3( baseRing[1][0] - center[0], baseRing[1][1]-center[1], baseRing[1][2]-center[2] );
	var v3 = new THREE.Vector3();
	v3.crossVectors( v2, v1 );

	return [v3.x,v3.y,v3.z];
}

/* Get the projected points of the extrussion extroke to a plane with normal and point give it 
   by the parameters
*/
function getProjectionPoints(extrussionStroke,normal,gravityPoint,vector,cameraPoint){

	var planeEcuation = getPlaneEcuation(gravityPoint,normal,vector);
	
	var projectedPoints = extrussionStroke.map(function(point){
		var newPoint = getProjectPoint(planeEcuation,point,cameraPoint);
		return newPoint;
	});
	return {projectedPoints:projectedPoints,planeEcuation:planeEcuation};
}

function getPlaneEcuation(point,u,v){
	var a = u[1]*v[2] - v[1]*u[2];
	var b = u[0]*v[2] - v[0]*u[2];
	var c = u[0]*v[1] - v[0]*u[1];
	var d = -a*point[0] + b*point[1] - c*point[2];

	var plane = {A:a,B:-b,C:c,D:d};
	return plane;
}


/* Project one point to the plane give it the camera point */
function getProjectPoint(planeEcuation,point,cameraPoint){
	/* Get the vector */
	var vector = [point[0]-cameraPoint[0],point[1]-cameraPoint[1],point[2]-cameraPoint[2]];
	var tParameter = getTparameter(planeEcuation,point,vector);
	//console.info("t parameter",tParameter);
	var x = point[0]+(tParameter* vector[0]);
	var y = point[1]+(tParameter* vector[1]);
	var z = point[2]+(tParameter* vector[2]);

	var projectedPoint = [x,y,z];
	return projectedPoint;
}

/* Get t parameter to intersect the rect with the plane, point is the point we want to project */
function getTparameter(planeEcuation,point,vector){

	//var vector = [point[0]-cameraPoint[0],point[1]-cameraPoint[1],point[2]-cameraPoint[2]];
	var Aplane = planeEcuation.A;
	var Bplane = planeEcuation.B;
	var Cplane = planeEcuation.C;
	var Dplane = planeEcuation.D;

	var Apoint = point[0];
	var Bpoint = point[1];
	var Cpoint = point[2];

	var Ax = vector[0];
	var By = vector[1];
	var Cz = vector[2];
	
	var t = -(Aplane*Apoint + Bplane*Bpoint + Cplane*Cpoint + Dplane) / ( Aplane*Ax +Bplane*By +Cplane*Cz );  
	
	return t;
}

/* Return the points that conforms the copy rings */
function generateCopyRings(stroke,normalVector,gravityPoint,baseRing){
	var parameters = generateParametersForRings(stroke,normalVector);
	/* Get the distance to te origin */
	var distance = [0-gravityPoint[0],0-gravityPoint[1],0-gravityPoint[2]];
	var axisVector = normalize(normalVector);
	var copyRings = [];
	var lastPoint;
	copyRings.push(baseRing);
	parameters.forEach(function(parameter,index,array){
		var factor = parameter.resizeFactor;
		var angle = parameter.angle;
		var finalPosition = parameter.finalPosition;
		var finalDistance = [finalPosition[0]-gravityPoint[0],finalPosition[1]-gravityPoint[1],finalPosition[2]-gravityPoint[2]];
		
		if(angle != null && factor!= null){
			var baseRingNew = baseRing.map(function(point){
				/*Move a point such distance (distance from the gravity point to the origin)*/
				point = translatePoint(point,distance);
				/* Resize de point */
				point = resizePoint(point,factor);
				/* Rotate a point*/
				point = rotatePoint(point,angle,axisVector);
				/* Translate the point to the original position*/
				point = translatePoint(point,[-distance[0],-distance[1],-distance[2]]);
				/* Translate the point to the final position*/
				point = translatePoint(point,finalDistance);

				return point;
			});
			//strokeDibujar.push(drawStrokeLine(baseRingNew,escena2));
			copyRings.push(baseRingNew);
		}
		/* Get the final position to sweep the triangles*/
		else
			lastPoint = finalPosition;

	});

	return {copyRings:copyRings,lastPoint:lastPoint};
	
}

/* Translate a point give it a distance */
function translatePoint(point,distance){
	point = [point[0]+distance[0],point[1]+distance[1],point[2]+distance[2]];
	return point;
}

/* Resize a point give it a factor */
function resizePoint(point,factor){
	point = [point[0],point[1]*factor,point[2]*factor];
	return point;
}

/* Rotate a point in the axis vector that has to be normalize*/
function rotatePoint(point,angle,axisVector){
	var angleR = -(angle)*Math.PI/180;
	var cos = Math.cos(angleR);
	var sin = Math.sin(angleR);
	var ux = axisVector[0];
	var uy = axisVector[1];
	var uz = axisVector[2];

	var rotx = ((ux*ux*(1-cos))+cos)*point[0] + ((ux*uy*(1-cos)) - uz*sin)*point[1] + ((ux*uy*(1-cos)) + uy*sin)*point[2];
	var roty = ((uy*ux*(1-cos)) + uz*sin)*point[0] + (cos + (uy*uy*(1-cos)))*point[1] + ((uz*uy*(1-cos)) - ux*sin)*point[2];
	var rotz = ((ux*uz*(1-cos)) - uy*sin)*point[0] + ((uy*uz*(1-cos)) + ux*sin)*point[1] + (cos + (uz*uz*(1-cos)))*point[2];
	point = [rotx,roty,rotz];
	return point;
}

/* Get the parameters to generate the copies for the ring base along the extrussion stroke */
function generateParametersForRings(stroke,normalVector){
	var leftPointerIndex = 0;
	var rightPointerIndex = stroke.length-1;
	var originalDistance = 0;
	var originalVector = null;
	/* Variable that contains the parameters for the copie rings */
	var finalParameters = [];

	while(leftPointerIndex != rightPointerIndex){
		var leftPointer = stroke[leftPointerIndex];
		var rightPointer = stroke[rightPointerIndex];
		//drawStrokeLineWith2points(leftPointer,rightPointer,strokeDibujar,escena2);
		var dx = leftPointer[0] - rightPointer[0];
		var dy = leftPointer[1] - rightPointer[1];
		var dz = leftPointer[2] - rightPointer[2];
		/* Get the distance of the vector */
		var distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
		/* Get vector */
		var vector = [leftPointer[0]-rightPointer[0],leftPointer[1]-rightPointer[1],leftPointer[2]-rightPointer[2]];
		/* Get the original distance and vector */
		if(originalDistance == 0)
			originalDistance = distance;
		if(originalVector==null)
			originalVector = vector;
		/* Get the angle between the actual vector and the original vector, the normal vector specified the axis rotation*/
		var angle = getAngleBetweenVectors(vector,originalVector,normalVector);
		/* Get the factor the ring has to resize */
		var factor = distance/originalDistance;
		/* Get the mid point of the vector*/
		var midPoint = [(leftPointer[0]+rightPointer[0])/2,(leftPointer[1]+rightPointer[1])/2,(leftPointer[2]+rightPointer[2])/2];
		finalParameters.push({finalPosition:midPoint,angle:angle,resizeFactor:factor});
		/* If I am in the last pointers*/
		if(leftPointerIndex+1 == rightPointerIndex-1){
			break;
		}
		/* Get the first diagonal vector and their coresponds vectors to get the angles */
		var a = leftPointer;
		var b = stroke[rightPointerIndex-1];
		var c = stroke[rightPointerIndex-2];
		var d = stroke[leftPointerIndex+1];
		
		var angleDV1 = getErrorAngle(a,b,c,d,90);
		var diagonalVector1 = [b[0]-a[0],b[1]-a[1],b[2]-a[2]];

		/* Get the second diagonal vector and their corresponds vectors to get the angles*/
		var a = rightPointer;
		var b = stroke[leftPointerIndex+1];
		var c = stroke[leftPointerIndex+2];
		var d = stroke[rightPointerIndex-1];
		
		var angleDV2 = getErrorAngle(a,b,c,d,90);
		var diagonalVector2 = [b[0]-a[0],b[1]-a[1],b[2]-a[2]];

		/* Get the third diagonal vector */
		var a = stroke[leftPointerIndex+1];
		var b = stroke[rightPointerIndex-1];
		var c = stroke[rightPointerIndex-2];	
		var d = stroke[leftPointerIndex+2];

		var angleDV3 = getErrorAngle(a,b,c,d,90);
		var diagonalVector3 = [b[0]-a[0],b[1]-a[1],b[2]-a[2]];
		var resultAngle = getMinValue(angleDV1,angleDV2,angleDV3);

		/*if(resultAngle == 1){
			rightPointerIndex = rightPointerIndex-1;
		}
		else if(resultAngle == 2){
			leftPointerIndex = leftPointerIndex+1;
		}
		else if(resultAngle == 3){
			leftPointerIndex = leftPointerIndex+1;
			rightPointerIndex = rightPointerIndex-1;		
		}*/
		leftPointerIndex = leftPointerIndex+1;
		rightPointerIndex = rightPointerIndex-1;
		
	}
	/* Add the las point to sweep the ring */
	finalParameters.push({finalPosition:stroke[leftPointerIndex+1],angle:null,resizeFactor:null});
	return finalParameters;
}

/*Generate the final triangles for the extrussion stroke*/
function sweepRings(rings,lastPoint,malla,escena,color){
	var finalTriangles = [];
	for(var j = 1; j < rings.length; j ++){
		var ring1=null;
		var ring2=null;
		
		ring1 = rings[j-1];
		ring2 = rings[j];
		generateTrianglesExtrussion(ring1,ring2,finalTriangles);
		
	}
	/* Genero los ultimos triangulos */
	generateTrianglesExtrussionWithFinalPoint(rings[rings.length-1],lastPoint,finalTriangles);
	var object3Dextrussion = generateMesh3dObject2(finalTriangles,malla,color);
	escena.add(object3Dextrussion);
	
	return object3Dextrussion;
}


/* Give it 4 points returns the average angle between the vectors formed by this points*/
function getAverageAngle(a,b,c,d){

	var vectorAB = [a[0]-b[0],a[1]-b[1],a[2]-b[2]];
	var vectorCB = [c[0]-b[0],c[1]-b[1],c[2]-b[2]];
	var angle1 = getAngleBetweenVectors(vectorAB,vectorCB,null);

	var vectorDA = [d[0]-a[0],d[1]-a[1],d[2]-a[2]];
	var vectorBA = [b[0]-a[0],b[1]-a[1],b[2]-a[2]];
	var angle2 = getAngleBetweenVectors(vectorDA,vectorBA,null);
	var angleAVG = (angle1+angle2)/2;

	return angleAVG;
}

/* Give it 4 points returns the average angle between the vectors formed by this points*/
function getErrorAngle(a,b,c,d,value){

	var vectorAB = [a[0]-b[0],a[1]-b[1],a[2]-b[2]];
	var vectorCB = [c[0]-b[0],c[1]-b[1],c[2]-b[2]];
	var angle1 = getAngleBetweenVectors(vectorAB,vectorCB,null);

	var vectorDA = [d[0]-a[0],d[1]-a[1],d[2]-a[2]];
	var vectorBA = [b[0]-a[0],b[1]-a[1],b[2]-a[2]];
	var angle2 = getAngleBetweenVectors(vectorDA,vectorBA,null);

	var error = Math.abs(angle1-value) + Math.abs(angle2-value);
	
	return error;
}

function getMinValue(v1,v2,v3){
	if(v1 <= v2 && v1 <= v3)
		return 1;
	if(v2 <= v1 && v2 <= v3)
		return 2;
	if(v3 <= v1 && v3 <= v2)
		return 3;
	console.info("Error en getMinValue",v1,v2,v3);
	return 0;
}

/* Angle between v1 y v2, its necesary give it the rotate vector u, to know if the angle es positive or negative, if
   this parameter is null, the result angle is always positive*/
function getAngleBetweenVectors(v1,v2,u){
	
	var a = new THREE.Vector3( v1[0], v1[1], v1[2] );
	var b = new THREE.Vector3( v2[0], v2[1], v2[2]  );
	var radAngle = a.angleTo(b);
	var angle = (radAngle*180)/ Math.PI;

	if(u == null)
		return angle;

	/* This represent the axis vector to rotate the vector */
	var axisVector = new THREE.Vector3(u[0], u[1], u[2]);

	//axisVector.crossVectors(a,b);
	axisVector.normalize();
	a.applyAxisAngle(axisVector,radAngle);
	var flagAngle = (a.angleTo(b)*180)/ Math.PI;
	//console.info("A",a,"b",b,"angulo",angle2)
	if(flagAngle < 1)
		return angle;
	else
		return -angle;
}

/* obtiene el valor mas cercano al valor enviado por parametro*/
function getClosesValue(angle1,angle2,angle3,value){
	var v1 = Math.abs(value-angle1);
	var v2 = Math.abs(value-angle2);
	var v3 = Math.abs(value-angle3);
	
	if(v1 <= v2 && v1 <= v3)
		return angle1;
	if(v2 <= v1 && v2 <= v3)
		return angle2;
	if(v3 <= v1 && v3 <= v2)
		return angle3;
	console.info("Error en getClosesValue",v1,v2,v3)
}

function normalize(vector){

	var x = vector[0];
	var y = vector[1];
	var z = vector[2];

	var mag = Math.sqrt(x*x + y*y + z*z);

	return [x/mag,y/mag,z/mag];
}

function generateTrianglesExtrussion(baseRing1,baseRing2,finalTriangles){
	//var finalTriangles = [];
	for (var i = 1; i < baseRing1.length; i++){
		var point1 = baseRing1[i-1];
		var point2 = baseRing1[i];

		var point3 = baseRing2[i-1];
		var point4 = baseRing2[i];

		var vertex1 = new Vertex(point1[0],point1[1],point1[2]);
		var vertex2 = new Vertex(point2[0],point2[1],point2[2]);
		var vertex3 = new Vertex(point3[0],point3[1],point3[2]);
		var vertex4 = new Vertex(point4[0],point4[1],point4[2]);

		var edge1Triangle1 = new Edge(vertex1,vertex3,5);
		var edge2Triangle1 = new Edge(vertex3,vertex4,5);
		var edge3Triangle1 = new Edge(vertex4,vertex1,5);

		var edge1Triangle2 = new Edge(vertex1,vertex4,5);
		var edge2Triangle2 = new Edge(vertex4,vertex2,5);
		var edge3Triangle2 = new Edge(vertex2,vertex1,5);

		var triangle1 = new Triangle(vertex1,vertex3,vertex4,[edge1Triangle1,edge2Triangle1,edge3Triangle1]);
		var triangle2 = new Triangle(vertex1,vertex4,vertex2,[edge1Triangle2,edge2Triangle2,edge3Triangle2]);

		finalTriangles.push(triangle1,triangle2);

	}
}

function generateTrianglesExtrussionWithFinalPoint(baseRing,finalPoint,finalTriangles){
	for (var i = 1; i < baseRing.length; i++){
		var point1 = baseRing[i-1];
		var point2 = baseRing[i];
		var vertex1 = new Vertex(point1[0],point1[1],point1[2]);
		var vertex2 = new Vertex(point2[0],point2[1],point2[2]);
		var vertex3 = new Vertex(finalPoint[0],finalPoint[1],finalPoint[2]);
		
		var edge1Triangle = new Edge(vertex1,vertex3,5);
		var edge2Triangle = new Edge(vertex3,vertex2,5);
		var edge3Triangle = new Edge(vertex2,vertex1,5);

		var triangle = new Triangle(vertex1,vertex3,vertex2,[edge1Triangle,edge2Triangle,edge3Triangle]);
		
		finalTriangles.push(triangle);

	}
}

/* Rotate a vector give it the angle */
function rotateVector(vector,angle){
	
	/* Vector in the y axis */
	var vectorY = new THREE.Vector3(0,1,0);
	angle = angle*Math.PI/180;
	
	vector = new THREE.Vector3(vector[0],vector[1],vector[2]);

	/* This represent the axis vector to rotate the result vector */
	var axisVector = new THREE.Vector3();
	axisVector.crossVectors(vectorY,vector);

	axisVector.normalize();

	vector.applyAxisAngle(axisVector,-angle);

	return [vector.x,vector.y,vector.z];
}

/* Give it an object and a vector, apply the object matrix transform to the vector */
function applyMatrixTransform(object,vector){
	object.updateMatrix();
	var vectorNew = new THREE.Vector3( vector[0], vector[1], vector[2] );
	vectorNew.applyMatrix4(object.matrix);
	object.updateMatrix();
	vector = [vectorNew.x,vectorNew.y,vectorNew.z];
	return vector;
}
