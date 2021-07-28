// Inicializar cena e camara 
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500);

// Inicializar o audio 
const listener = new THREE.AudioListener();
camera.add( listener );

// Posicionamento da camara
camera.position.x = 0;
camera.position.y = 5;
camera.position.z = 11;

// Objetos que aceitam intereção de drag controls
var objects = [];

// Variável para calculo do tempo entre frames para simular movimento 
var lastTime = new Date().getTime()

// Renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Cor original de um objeto, utilizado para alterar e voltar à cor original quando se pega num objeto
var startColor;

function init() {

	// Drag Controls
	var controls = new THREE.DragControls( objects, camera, renderer.domElement );
	controls.transformGroup = true
	controls.addEventListener( 'dragstart', dragStartCallback );
	controls.addEventListener( 'dragend', dragendCallback );

	// Texture Loader
	const loader = new THREE.TextureLoader();

	// Luz ambiente
	scene.add( new THREE.AmbientLight( 0x0f0f0f ) );

	// ***************************** //
	// Add spotlight (with shadows)
	// ***************************** //
	const spotLight = new THREE.SpotLight('rgb(255, 255, 255)', 0.7);
	const spotLight2 = new THREE.SpotLight('rgb(255, 255, 255)', 0.7);
	const spotLight3 = new THREE.SpotLight('rgb(255, 255, 255)', 0.4);
	const spotLight4 = new THREE.SpotLight('rgb(255, 255, 255)', 0.4);

	spotLight.position.set(-10, 50, 10);
	spotLight2.position.set(10, 50, 10);
	spotLight3.position.set(-10, 50, -10);
	spotLight4.position.set(10, 50, -10);

	scene.add(spotLight);
	scene.add(spotLight2);
	scene.add(spotLight3);
	scene.add(spotLight4);

	// Setup shadow properties for the spotlight
	spotLight.castShadow = true;
	spotLight.shadow.mapSize.width = 2048;
	spotLight.shadow.mapSize.height = 2048;
	spotLight2.castShadow = true;
	spotLight2.shadow.mapSize.width = 2048;
	spotLight2.shadow.mapSize.height = 2048;
	spotLight3.castShadow = true;
	spotLight3.shadow.mapSize.width = 2048;
	spotLight3.shadow.mapSize.height = 2048;
	spotLight4.castShadow = true;
	spotLight4.shadow.mapSize.width = 2048;
	spotLight4.shadow.mapSize.height = 2048;

	// Criar o chão e uma skybox com o publico 
	const groundGeometry = new THREE.BoxGeometry(70, 0.1, 70);
	const skyboxGeometry = new THREE.BoxGeometry( 70, 70, 70);

	const groundMaterial = new THREE.MeshPhongMaterial({
		map: loader.load('textures/floor.jpg'),
		side: THREE.DoubleSide,
	});

	const groundObject = new THREE.Mesh(groundGeometry, groundMaterial);

	const crowdMaterial = new THREE.MeshPhongMaterial({
		map: loader.load('textures/crowd.jpg'),
		side: THREE.DoubleSide,
	});

	const skyboxObject = new THREE.Mesh(skyboxGeometry, crowdMaterial);
	skyboxObject.position.set(0,34,0)
	groundObject.position.set(0,0,0)
	scene.add(groundObject);
	scene.add(skyboxObject)

	//Criar objetos de interação no jogo
	createTable();
	var wallGeometry = new THREE.BoxGeometry(4.65,10,0.5);
	const wallMaterial = new THREE.MeshPhongMaterial({
		map: loader.load('textures/target.jpg'),
		side: THREE.DoubleSide,
	});
	var wallObject = new THREE.Mesh(wallGeometry, wallMaterial);
	var wallObject2 = new THREE.Mesh(wallGeometry, wallMaterial);
	wallObject2.castShadow = true; 
	wallObject2.receiveShadow = true
	wallObject.position.set(0,5,-4.5);
	scene.add(wallObject)
	
	createBall(loader);
	createBallShadow();
	createRubberShadow();
 
	var handleGeometry = new THREE.CylinderGeometry( 0.05, 0.05, 0.3, 32 );
	var rubberGeometry = new THREE.CylinderGeometry( 0.3, 0.3, 0.06, 32 );
	const woodMaterial = new THREE.MeshPhongMaterial({
		map: loader.load('textures/lightwood.jpg'),
		side: THREE.DoubleSide,
	});
	const rubberMaterial = new THREE.MeshPhongMaterial({
		map: loader.load('textures/redRubber.jpg'),
		side: THREE.DoubleSide,
	});
	var paddleHandle = new THREE.Mesh(handleGeometry, woodMaterial);
	var paddleRubber = new THREE.Mesh(rubberGeometry, rubberMaterial);
	paddleRubber.rotateX(Math.PI / 2);
	paddleHandle.position.set(0, 3, 4);
	paddleRubber.position.set(0, 3.45, 4)

	paddleHandle.name = "handle"
	paddleRubber.name = "rubber"
	objects.push(paddleHandle);
	scene.add(paddleHandle)
	scene.add(paddleRubber);
}

//-----------------------------------------------CREATE TABLE FUNCTION----------------------------------------------------
function createTable() {
	var returnObject;
	var objLoader = new THREE.OBJLoader();
	var mtlLoader = new THREE.MTLLoader();
	mtlLoader.setTexturePath("/textures/");
	mtlLoader.load('/textures/tableTexture.mtl', function(materials){
		materials.preload()
		objLoader.setMaterials(materials)
		objLoader.setPath('/models/')
		objLoader.load('table.obj', function(object){
			object.rotateX(-Math.PI / 2)
			object.scale.set(0.03,0.03,0.03)
			scene.add(object);         
		})
	})
	return returnObject;
}

//-----------------------------------------------CREATE BALL FUNCTION----------------------------------------------------
function createBall(loader) {
	const ballGeometry = new THREE.SphereGeometry( 0.08, 32, 32 );
	const ballMaterial = new THREE.MeshPhongMaterial({
		map: loader.load('textures/ball.jpg'),
		side: THREE.DoubleSide,
	});
	const ballObject = new THREE.Mesh(ballGeometry, ballMaterial);
	ballObject.position.set(1,5,-4)
	ballObject.castShadow = true
	ballObject.receiveShadow = true
	ballObject.name = "ball"
	scene.add(ballObject)
}

//-----------------------------------------------CREATE BALL SHADOW FUNCTION----------------------------------------------------
function createBallShadow() {
	const ballShadowGeometry = new THREE.CylinderGeometry( 0.08, 0.08, 0.0002, 32 );
	const ballShadowMaterial = new THREE.MeshPhongMaterial({ color: 'rgb(50, 50, 50)' });
	const ballShadowObject = new THREE.Mesh(ballShadowGeometry, ballShadowMaterial);
	ballShadowObject.position.set(1,2.43,-4)
	ballShadowObject.name = "ballShadow"
	scene.add(ballShadowObject);
}

//-----------------------------------------------CREATE RUBBER SHADOW FUNCTION----------------------------------------------------
function createRubberShadow() {
	const rubberShadowGeometry = new THREE.BoxGeometry( 0.6,0.0002, 0.06);
	const rubberShadowMaterial = new THREE.MeshPhongMaterial({ color: 'rgb(50, 50, 50)' });
	const rubberShadowObject = new THREE.Mesh(rubberShadowGeometry, rubberShadowMaterial);
	rubberShadowObject.position.set(0,2.43,4)
	rubberShadowObject.name = "rubberShadow"
	scene.add(rubberShadowObject);
}

// Drag controls events
function dragStartCallback(event) {
	startColor = event.object.material.color.getHex();
	event.object.material.color.setHex(0x000000);
}

function dragendCallback(event) {
	event.object.material.color.setHex(startColor);
}

function onWindowResize() {
 
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
   
	renderer.setSize( window.innerWidth, window.innerHeight );
   
  }

// Variables to calculate movement
var delta = 0;
var sigma = 1;
var alpha = 1; 
var potency = 9;
var ignore = 0;
var lastX = 0;
var curve = 0;
var minHeight = 2.6;
var score = 0;

function animate() {
	
	// loader in order to create new balls 
	const loader = new THREE.TextureLoader();
	
	// scene elements
	const rubber = scene.getObjectByName("rubber");
	const handle = scene.getObjectByName("handle");
	const ball = scene.getObjectByName("ball");
	var ballShadow = scene.getObjectByName("ballShadow");
	var rubberShadow = scene.getObjectByName("rubberShadow");
	var curTime = new Date().getTime();
	var curX = rubber.position.x;
	
	// time and x diferences from last frame 
	var timeDif = (curTime - lastTime) / 3500
	var xDif = curX - lastX 

	lastX = curX
	lastTime = curTime

	//restart ball if it's about to hit the ground
	if(ball.position.y < 1){
		scene.remove(ball);
		const sound = new THREE.Audio( listener );
		const audioLoader = new THREE.AudioLoader();
		audioLoader.load( '/audios/GameOver.ogg', function( buffer ) {
			sound.setBuffer( buffer );
			sound.play();
		});
		createBall(loader);
		delta = 0;
		score = 0;
		sigma = 1;
		alpha = 1; 
		potency = 9;
		ignore = 1;
		lastX = 0;
		curve = 0;
		minHeight = 2.6;
		document.getElementById("score").textContent=score;
	}

	//ball and racket movement
	rubber.position.set(handle.position.x, handle.position.y+0.45, handle.position.z );
	ball.position.set(ball.position.x + curve*0.1, ball.position.y - (9.8 * timeDif * sigma) + (timeDif*delta*potency/3), ball.position.z + 20*timeDif*alpha)
	
	//calculate shadow position if within the table
	if(ball.position.x < 2.485 && ball.position.x > -2.485 && ball.position.z < 4.26 && ball.position.z > -4.26){
		var ballShadow = scene.getObjectByName("ballShadow");
		if (ballShadow == undefined){
			createBallShadow();
			ballShadow = scene.getObjectByName("ballShadow");
		}
		ballShadow.position.set(ball.position.x, 2.43, ball.position.z);	
	}
	else{
		scene.remove(ballShadow)
	}

	// rubber shadow position within the table
	if(rubber.position.x < 2.485 && rubber.position.x > -2.485 ){
		var rubberShadow = scene.getObjectByName("rubberShadow");
		if (rubberShadow == undefined){
			createRubberShadow();
			rubberShadow = scene.getObjectByName("rubberShadow");
		}
		rubberShadow.position.set(rubber.position.x, 2.43, rubber.position.z)
	}
	else{
		scene.remove(rubberShadow)
	}

	// ball movement 
	if(ignore == 0){
		if(ball.position.y < minHeight){
			if((ball.position.x > 2.485 || ball.position.x < -2.485 || ball.position.z > 4.26 || ball.position.z < -4.26) && minHeight != 0){
				minHeight = 0 
			}
			else{
				const sound = new THREE.Audio( listener );
				const audioLoader = new THREE.AudioLoader();
				audioLoader.load( '/audios/pingpongboard.ogg', function( buffer ) {
					sound.setBuffer( buffer );
					sound.play();
				});
				delta = 1
				ignore = 1
				if(potency != 0){
					potency = potency - 0.1
					sigma = sigma * -1 
				}
			}
		}
		if(ball.position.y >  potency-4){
			ignore = 1
			delta = 0
			sigma = sigma * -1
		}
	}
	else{
		ignore = ignore -1 ;
	}

	// wall hit recognition 
	if(ball.position.z < -4.04){
		if((ball.position.x < 2.485) && (ball.position.x > -2.485)){
			if((ball.position.y < 10) && (ball.position.y > 2.5)){
				abs_x = Math.abs(ball.position.x);
				if(abs_x < 1.5 ){

				const sound = new THREE.Audio( listener );
				const audioLoader = new THREE.AudioLoader();
				audioLoader.load( '/audios/reward.wav', function( buffer ) {
					sound.setBuffer( buffer );
					sound.play();
				});

					score = score + 10
					if(abs_x <1 ){
						score = score + 10 
						if(abs_x<0.5){
							score = score + 30
						}
					}
				}
				alpha = alpha * -1 ;
				document.getElementById("score").textContent=score;
			}
		}
	}

	// racket hit recognition
	if(ball.position.z > 3.85 && ball.position.z <3.94){
		if((ball.position.x < rubber.position.x + 0.23) && (ball.position.x > rubber.position.x -0.23)){
			if((ball.position.y < rubber.position.y + 0.23) && (ball.position.y > rubber.position.y -0.23)){
				alpha = alpha * -1 ;
				potency = 9 ;
				curve = xDif

				const sound = new THREE.Audio( listener );
				const audioLoader = new THREE.AudioLoader();
				audioLoader.load( '/audios/pingpongbat.ogg', function( buffer ) {
					sound.setBuffer( buffer );
					sound.play();
				});
			}
		}
	}

	requestAnimationFrame( animate );

	renderer.render(scene, camera);
};

window.addEventListener('resize', onWindowResize);
window.onload = init();
animate();