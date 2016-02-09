/*function extrussion(baseRing,extrussionStroke,stroke){
	
	var normalGravityValue = getNormalAndGravityCenter(baseRing,stroke);
	var gravityCenter = normalGravityValue.gravityCenter;
	var baseRingNormal = normalGravityValue.normal;

	var projectedPoints = getProjectionPoints(extrussionStroke,baseRingNormal,gravityCenter);

	console.info(projectedPoints)
	return projectedPoints;
}*/

function extrussion(baseRingNormal,gravityCenter,vector,extrussionStroke,stroke){
	
	var projectedPoints = getProjectionPoints(extrussionStroke,baseRingNormal,gravityCenter,vector,stroke);

	console.info(projectedPoints)
	return projectedPoints;
}

/* Get the baseRing normal and its gravity center */
function getNormalAndGravityCenter(baseRing,stroke){
	var AxySum = 0;
	var AzxSum = 0;
	var AyzSum = 0;
	var cX = 0;
	var cY = 0;
	var cZ = 0;
	for (var i = 1;i < baseRing.length;i++){
		AxySum = ((baseRing[i-1].x)*(baseRing[i].y)) - ((baseRing[i].x)*(baseRing[i-1].y));
		AzxSum = ((-baseRing[i-1].z)*(baseRing[i].x)) - ((-baseRing[i].z)*(baseRing[i-1].x));
		AyzSum = ((baseRing[i-1].y)*(-baseRing[i].z)) - ((baseRing[i].y)*(-baseRing[i-1].z));
		//console.info(AxySum)
		cX = cX + baseRing[i-1].x;
		cY = cY + baseRing[i-1].y;
		cZ = cZ + baseRing[i-1].z;
	}

	var Axy = 0.5*AxySum;
	var Azx = 0.5*AzxSum;
	var Ayz = 0.5*AyzSum;

	var p1 = [cX/baseRing.length,cY/baseRing.length,cZ/baseRing.length];
	var p2 = [Ayz,Azx,Axy];
	//drawStrokeLineWith2points(p1,[p2[0] + p1[0],p2[1]+ p1[1],p2[2]+ p1[2]],stroke,escena2);
	var v1 = new THREE.Vector3( baseRing[0].x - p1[0], baseRing[0].y-p1[1], baseRing[0].z-p1[2] );
	var v2 = new THREE.Vector3( baseRing[1].x - p1[0], baseRing[1].y-p1[1], baseRing[1].z-p1[2] );
	var v3 = new THREE.Vector3();

	v3.crossVectors( v2, v1 );
	p2 = [20*v3.x,20*v3.y,20*v3.z];
	drawStrokeLineWith2points(p1,[p2[0] + p1[0],p2[1]+ p1[1],p2[2]+ p1[2]],stroke,escena2);
	//renderEscena2();

	return {normal:p2,gravityCenter:p1};
}

/* Get the projected points of the extrussion extroke to a plane with normal and point give it 
   by the parameters
*/
function getProjectionPoints(extrussionStroke,normal,gravityPoint,vector,stroke){

	//var planeEcuation = getPlaneValuesWithNormal(normal,gravityPoint);
	vector = [vector[0]*20,vector[1]*20,vector[2]*20]
	var p1 = gravityPoint;
	var p2 = [normal[0] + p1[0],normal[1]+ p1[1],normal[2]+ p1[2]];
	var p3 = [vector[0] + p1[0],vector[1]+ p1[1],vector[2]+ p1[2]];

	drawStrokeLineWith2points(p1,p2,stroke,escena2);
	drawStrokeLineWith2points(p1,p3,stroke,escena2);
	var planeEcuation = getPlaneValues(gravityPoint,normal,vector);
	
	
	var p2 = [planeEcuation.A,planeEcuation.B,planeEcuation.C];
	//drawStrokeLineWith2points(p1,[p2[0] + p1[0],p2[1]+ p1[1],p2[2]+ p1[2]],stroke,escena2);
	//extrussionStroke = [[200,500,80]];
	var projectedPoints = extrussionStroke.map(function(point){
		var newPoint = getProjectPoint(planeEcuation,point);
		//console.info("old point ",point,"new point",newPoint);
		return newPoint;
	});
	//console.info("ecuacion plano",planeEcuation)
	//console.info("punto old",extrussionStroke,"new point",projectedPoints)
	return projectedPoints;
}

function getPlaneValues(point,u,v){
	/*var uVector = [u[0]-point[0],u[1]-point[1],u[2]-point[2]];
	var vVector = [v[0]-point[0],v[1]-point[1],v[2]-point[2]];

	var a = uVector[1]*vVector[2] - vVector[1]*uVector[2];
	var b = uVector[0]*vVector[2] - vVector[0]*uVector[2];
	var c = uVector[0]*vVector[1] - vVector[0]*uVector[1];
	var d = -a*point[0] + b*point[1] - c*point[2];
*/
	//u = [2,1,1];
	//v = [-1,2,0];
	//point = [1,1,1];
	console.info(u,v);
	var a = u[1]*v[2] - v[1]*u[2];
	var b = u[0]*v[2] - v[0]*u[2];
	var c = u[0]*v[1] - v[0]*u[1];
	var d = -a*point[0] + b*point[1] - c*point[2];

	var plane = {A:a,B:-b,C:c,D:d};
	console.info(plane);
	return plane;
}

/* Get the plane values Ax + By + Cz = D, give it the normal and one point*/
function getPlaneValuesWithNormal(normal,point){

	var A = normal[0];
	var B = normal[1];
	var C = normal[2];
	var D = normal[0]*(-point[0]) + normal[1]*(-point[1]) +normal[2]*(-point[2]);

	return {A:A,B:B,C:C,D:D};
}

/* Project one point to the plane */
function getProjectPoint(planeEcuation,point){
	var tParameter = getTparameter(planeEcuation,point);
	//console.info("t parameter",tParameter);
	var x = point[0]+(tParameter* planeEcuation.A);
	var y = point[1]+(tParameter* planeEcuation.B);
	var z = point[2]+(tParameter* planeEcuation.C);

	var projectedPoint = [x,y,z];
	return projectedPoint;
}

/* Get t parameter to intersect the rect with the plane, point is the point we want project */
function getTparameter(planeEcuation,point){

	var Aplane = planeEcuation.A;
	var Bplane = planeEcuation.B;
	var Cplane = planeEcuation.C;
	var Dplane = planeEcuation.D;

	var Apoint = point[0];
	var Bpoint = point[1];
	var Cpoint = point[2];

	/*console.info("plane",Aplane,Bplane,Cplane,Dplane)
	console.info("normal",Anormal,Bnormal,Cnormal)
	console.info("punto ",Apoint,Bpoint,Cpoint)*/
	var t = -(Aplane*Apoint + Bplane*Bpoint + Cplane*Cpoint + Dplane) / ( Aplane*Aplane +Bplane*Bplane +Cplane*Cplane );  
	
	return t;
}

/* Angle between v1 y v2 */
function getAngleBetweenVectors(v1,v2){
	var num = (v1[0]*v2[0]) + (v1[1]*v2[1]) +(v1[2]*v2[2]);
	var magV1 = Math.sqrt((v1[0]*v1[0]) + (v1[1]*v1[1]) + (v1[2]*v1[2]));
	var magV2 = Math.sqrt((v2[0]*v2[0]) + (v2[1]*v2[1]) + (v2[2]*v2[2]));

	var denom = magV1 * magV2;
	var angle = (Math.acos(num/denom)*180)/3.1416;
	return angle;
}

function  getLines(stroke){
	var a = stroke[0];
	var b = stroke[stroke.length-1];
	var c = stroke[0+1];
	var d = stroke[stroke.length-2];
	var e = stroke[0+2];
	var f = stroke [stroke.length-3];

	var bc = [c.X - b.X , c.Y -b.Y,0];
	var bd = [d.X - b.X , d.Y -b.Y,0];
	var ce = [e.X - c.X , e.Y -c.Y,0];

	var angle1 = getAngleBetweenVectors(bc,bd);
	var angle2 = getAngleBetweenVectors(bc,ce);

	console.info(angle1,angle2);
	
}