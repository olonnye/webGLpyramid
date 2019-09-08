if (!Detector.webgl) Detector.addGetWebGLMessage();

var info = new Info(
  "Sound Pyramid",
  [
    'Created by <a href="http://www.olonnye.com">Olonnye Taylor</a>',
    "Concept by Melody Neumann",
    'Sand from <a href="http://www.textures.com/" target="_blank">textures.com</a>',
    "Left mouse orbit, middle mouse zoom",
    "Q,A,W,S keys to play notes"
  ].join("<br>")
);

var container;

var camera, controls, scene, renderer;

var pyramidGroup;
var pyramidTop;

var points;
var sprite;

var sounds = [];

var mouse = new THREE.Vector2();
var INTERSECTED, SELECTED;
var raycaster = new THREE.Raycaster();

var FLOOR = -100;

// ---------------------------------------------

var Sound = function(sources) {
  this.audio = document.createElement("audio");

  for (var i = 0; i < sources.length; i++) {
    this.source = document.createElement("source");
    this.source.src = sources[i];
    this.audio.appendChild(this.source);
  }
};

Sound.prototype.play = function() {
  this.audio.load();
  this.audio.play();
};

// ---------------------------------------------

init();

function init() {
  container = document.getElementById("container");

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xe3cab3, 500, 1000);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(0xe3cab3, 1);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    100000
  );
  camera.position.set(90, 150, 400);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.minPolarAngle = Math.PI / 8;
  controls.maxPolarAngle = Math.PI / 2;
  controls.enablePan = false;
  controls.minDistance = 200;
  controls.maxDistance = 700;

  // THREE.DefaultLoadingManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
  //   console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
  // };

  THREE.DefaultLoadingManager.onLoad = function() {
    const loading = document.querySelector("#loading");
    if (loading) document.body.removeChild(document.querySelector("#loading"));
    container.appendChild(renderer.domElement);

    // sand.receiveShadow = true;
    // pyramidGroup.traverse(function(obj){
    // 	if(obj.isMesh) {
    // 		obj.castShadow = true;
    // 		obj.receiveShadow = true;
    // 	}
    // });

    loop();
  };

  var textureLoader = new THREE.TextureLoader();
  var jsonLoader = new THREE.JSONLoader();

  // var axisHelper = new THREE.AxesHelper( 100 );
  // scene.add( axisHelper );

  var alight = new THREE.AmbientLight(0x404040); // soft white light
  scene.add(alight);

  var keyLight = new THREE.DirectionalLight(0xffffff, 0.3);
  keyLight.position.set(1, 1, 1).multiplyScalar(100);
  scene.add(keyLight);

  var fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
  fillLight.position.set(-1, 0, -1).multiplyScalar(100);
  scene.add(fillLight);

  // shadows

  // renderer.gammaInput = true;
  // renderer.gammaOutput = true;
  // renderer.shadowMap.enabled = true;
  // renderer.shadowMap.renderReverseSided = false;

  // function shadow(light) {
  // 	light.castShadow = true;
  // 	light.shadow.mapSize.width = 2048;
  // 	light.shadow.mapSize.height = 2048;
  // 	var d = 100;
  // 	light.shadow.camera.left = -d;
  // 	light.shadow.camera.right = d;
  // 	light.shadow.camera.top = d;
  // 	light.shadow.camera.bottom = -d;
  // 	light.shadow.camera.far = 3500;
  // 	light.shadow.bias = -0.0001;

  // 	// var camHelper = new THREE.CameraHelper( light.shadow.camera );
  // 	// scene.add( camHelper );
  // }

  // shadow(keyLight);
  // shadow(fillLight);

  // ------------------------------------------------------------

  // dome

  var sphereMat = new THREE.MeshBasicMaterial({
    color: 0x5a4d3e,
    wireframe: true,
    transparent: true,
    opacity: 0.6
  });

  var sphereGeo1 = new THREE.SphereGeometry(600, 20, 10);
  var sphereGeo2 = new THREE.IcosahedronGeometry(700, 2);

  var sphere1 = new THREE.Mesh(sphereGeo1, sphereMat);
  var sphere2 = new THREE.Mesh(sphereGeo2, sphereMat);

  scene.add(sphere1);
  scene.add(sphere2);

  // ------------------------------------------------------------

  // Dust Particles

  // maybe try this instead
  // http://www.html5rocks.com/en/tutorials/casestudies/oz/

  var pointCount = 400;
  var pointsGeo = new THREE.Geometry();
  var pointsMat = new THREE.PointsMaterial({
    color: 0x7a5d43,
    size: 2
  });

  for (var p = 0; p < pointCount; p++) {
    var point = new THREE.Vector3(
      THREE.Math.randFloatSpread(500),
      THREE.Math.randFloat(0, 300 + FLOOR),
      THREE.Math.randFloatSpread(500)
    );

    pointsGeo.vertices.push(point);
  }

  points = new THREE.Points(pointsGeo, pointsMat);
  points.sortParticles = true;
  scene.add(points);

  // ------------------------------------------------------------

  // Sprites / Hieroglyphs

  // var map = textureLoader.load('textures/eye-of-horus.png');
  var map = textureLoader.load("textures/hieroglyphs.png");
  var material = new THREE.SpriteMaterial({
    map: map,
    color: 0xffffff,
    fog: true,
    transparent: true,
    opacity: 0.5
  });
  sprite = new THREE.Sprite(material);
  sprite.scale.setScalar(80);
  sprite.position.set(50, 80, 50);
  scene.add(sprite);

  // ------------------------------------------------------------

  // Sand / Ground

  var sandColor = textureLoader.load("textures/sand-color.jpg");
  sandColor.wrapS = sandColor.wrapT = THREE.RepeatWrapping;
  sandColor.repeat.set(8, 8);
  var sandMat = new THREE.MeshLambertMaterial({
    color: 0xcfbb9a,
    map: sandColor
  });

  var sandGeo = new THREE.PlaneBufferGeometry(4096, 4096, 1, 1);

  var sand = new THREE.Mesh(sandGeo, sandMat);
  scene.add(sand);
  sand.rotation.x = -Math.PI / 2;
  sand.position.y = FLOOR;

  // ------------------------------------------------------------

  pyramidGroup = new THREE.Group();
  scene.add(pyramidGroup);

  var pLight2 = new THREE.PointLight(0x00ffcc, 0.6, 500);
  pLight2.position.set(0, 130, 0);
  pyramidGroup.add(pLight2);

  // var plh2 = new THREE.PointLightHelper( pLight2, 25 );
  // scene.add( plh2 );

  var colorMap = textureLoader.load("textures/pyramid-color.jpg");
  var normalMap = textureLoader.load("textures/pyramid-normal.jpg");
  var specMap = textureLoader.load("textures/pyramid-spec.jpg");

  var brickMaterial = new THREE.MeshPhongMaterial({
    specular: 0xffffff,
    shininess: 7,
    side: THREE.DoubleSide,
    map: colorMap,
    normalMap: normalMap,
    specularMap: specMap
  });

  var borderMaterial = new THREE.MeshPhongMaterial({
    color: 0xffd7a0,
    specular: 0xffffff,
    shininess: 10,
    side: THREE.DoubleSide
  });

  var speakerMaterial = new THREE.MeshPhongMaterial({
    color: 0xae9066,
    specular: 0xffffff,
    shininess: 7
  });

  var modifier = new THREE.SubdivisionModifier(1);

  // todo: convert model to one fbx file

  jsonLoader.load("models/pyramidBase.js", function(geometry) {
    var base = new THREE.Mesh(geometry, brickMaterial);
    base.position.set(0, FLOOR, 0);
    base.scale.set(2, 2, 2);
    pyramidGroup.add(base);
    base.group = "base";
  });

  jsonLoader.load("models/speakerBorders.js", function(geometry) {
    modifier.modify(geometry);
    var borders = new THREE.Mesh(geometry, borderMaterial);
    borders.position.set(0, FLOOR, 0);
    borders.scale.set(2, 2, 2);
    pyramidGroup.add(borders);
    borders.group = "borders";
  });

  jsonLoader.load("models/pyramidTop.js", function(geometry) {
    pyramidTop = new THREE.Mesh(geometry, brickMaterial);
    pyramidTop.position.set(0, FLOOR, 0);
    pyramidTop.scale.set(2, 2, 2);
    pyramidGroup.add(pyramidTop);
    pyramidTop.group = "top";

    var pLight = new THREE.PointLight(0x00ffcc, 0.6, 500);
    pLight.position.set(0, 54, 0);
    pyramidTop.add(pLight);

    // var plh = new THREE.PointLightHelper( pLight, 25 );
    // scene.add( plh );

    // todo: fix center of pyramid top
    // var ah = new THREE.AxesHelper( 100 );
    // pyramidTop.add( ah );

    pyramidTop.position.y = FLOOR + 5;

    var tween = new TWEEN.Tween(pyramidTop.position)
      .to({ y: FLOOR + 30 }, 1500)
      .easing(TWEEN.Easing.Cubic.InOut);

    var tween2 = new TWEEN.Tween(pyramidTop.position)
      .to({ y: FLOOR + 5 }, 1500)
      .easing(TWEEN.Easing.Cubic.InOut);

    tween.chain(tween2);
    tween2.chain(tween);
    tween.start();
  });

  for (var i = 1; i <= 8; i++) {
    jsonLoader.load(
      "models/speakers/speaker" + i + ".js",
      (function(index) {
        // closure: https://youtu.be/HbgRFH9BAy0?t=30m57s
        return function(geometry, materials) {
          modifier.modify(geometry);
          var speaker = new THREE.Mesh(geometry, speakerMaterial.clone());
          speaker.position.set(0, FLOOR, 0);
          speaker.scale.set(2, 2, 2);
          pyramidGroup.add(speaker);
          speaker.name = "speaker" + index;
          speaker.group = "speakers";

          // ----------------------------------------

          // assign sound to speaker

          var name = parseInt(speaker.name.replace("speaker", ""));

          var sound;
          switch (name) {
            // front : back :
            case 1:
            case 5:
              sound = sounds[0];
              break;
            case 2:
            case 6:
              sound = sounds[1];
              break;
            case 3:
            case 7:
              sound = sounds[2];
              break;
            case 4:
            case 8:
              sound = sounds[3];
              break;

            default:
              sound = sounds[0];
              break;
          }

          speaker.userData.sound = sound;

          // ----------------------------------------

          // direction / axis / face normal of pyramid base side

          var normal = new THREE.Vector3(
            0.6457077325259278,
            0.40832318480986296,
            0.6452392586498092
          );

          speaker.geometry.computeBoundingBox();
          var boundingBox = speaker.geometry.boundingBox;
          var centerX = 0.5 * (boundingBox.max.x + boundingBox.min.x);
          var centerZ = 0.5 * (boundingBox.max.z + boundingBox.min.z);

          normal.x *= centerX > 0 ? 1 : -1;
          normal.z *= centerZ > 0 ? 1 : -1;

          // var centerY = 0.5 * ( boundingBox.max.y + boundingBox.min.y );
          // var center = new THREE.Vector3( centerX, centerY, centerZ);
          // var arrow = new THREE.ArrowHelper(normal, center, 200, 0xff0000);
          // scene.add( arrow );

          // ----------------------------------------

          var origin = (speaker.userData.origin = new THREE.Group());
          origin.position.copy(speaker.position);

          var target1 = (speaker.userData.target1 = new THREE.Group());
          target1.position.copy(speaker.position);
          target1.translateOnAxis(normal, 8);

          var target2 = (speaker.userData.target2 = new THREE.Group());
          target2.position.copy(speaker.position);
          target2.translateOnAxis(normal, -4);
        };
      })(i)
    );
  }

  // --------------------------------------------------------------

  var soundFiles = ["Ab", "Eb", "A", "E"];
  for (var i = 0; i < soundFiles.length; i++) {
    var sound = new Sound(["sounds/square/" + soundFiles[i] + ".mp3"]);
    sounds.push(sound);
  }

  // --------------------------------------------------------

  // var gui = new dat.GUI();

  // var opts = {
  // 	spriteScale: sprite.scale.x
  // };

  // gui.add(opts, 'spriteScale', 20, 200).onChange(function(val){
  // 	sprite.scale.setScalar(val);
  // });
  // gui.add(camera, 'fov', 10, 135).onChange(function(){
  // 	camera.updateProjectionMatrix();
  // });
  // gui.add(brickMaterial, 'shininess', 1, 30);

  // var f1 = gui.addFolder('fog');
  // f1.add(scene.fog, 'near', 1, 1000);
  // f1.add(scene.fog, 'far', 500, 1500);
  // f1.open();

  // --------------------------------------------------------

  document.addEventListener("mousemove", mousemove, false);
  document.addEventListener("mousedown", mousedown, false);
  document.addEventListener("mouseup", mouseup, false);

  //

  window.addEventListener("resize", resize, false);
}

// --------------------------------------------------------

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function mousemove(event) {
  event.preventDefault();

  // mouse x and y are between -1 and 1 (normalized?)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  findIntersections();
}

function speakerActivated(speaker) {
  speaker.userData.sound.play();

  var tween1 = new TWEEN.Tween(speaker.position)
    .to(speaker.userData.target1.position, 60)
    .easing(TWEEN.Easing.Cubic.Out);

  var tween2 = new TWEEN.Tween(speaker.position)
    .to(speaker.userData.target2.position, 60)
    .delay(60)
    .easing(TWEEN.Easing.Cubic.In);

  var tween3 = new TWEEN.Tween(speaker.position)
    .to(speaker.userData.origin.position, 60)
    .delay(60)
    .easing(TWEEN.Easing.Cubic.Out);

  tween1.chain(tween2);
  tween2.chain(tween3);
  tween1.start();
}

function mousedown(event) {
  event.preventDefault();

  var intersects = raycaster.intersectObjects(pyramidGroup.children);

  if (intersects.length > 0) {
    controls.enabled = false;

    SELECTED = intersects[0].object;

    if (SELECTED.group == "speakers") {
      speakerActivated(SELECTED);
    }
  }
}

function mouseup(event) {
  event.preventDefault();

  controls.enabled = true;

  if (INTERSECTED) {
    SELECTED = null;
  }
}

function findIntersections() {
  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects(pyramidGroup.children);

  if (intersects.length > 0) {
    if (INTERSECTED != intersects[0].object) {
      if (INTERSECTED) {
        INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
        container.style.cursor = "auto";
      }

      INTERSECTED = intersects[0].object;

      // console.log(INTERSECTED.name);

      // if ( INTERSECTED.name.indexOf('speaker') >= 0 ) {
      if (INTERSECTED.group == "speakers") {
        INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
        INTERSECTED.material.emissive.setHex(0x004f3f);
        container.style.cursor = "pointer";
      }
    }
  } else {
    if (INTERSECTED) {
      INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
      container.style.cursor = "auto";
    }

    INTERSECTED = null;
  }
}

//

function loop() {
  requestAnimationFrame(loop);

  points.rotation.y += 0.005;

  TWEEN.update();
  controls.update();

  renderer.render(scene, camera);
}

window.addEventListener("keydown", function(e) {
  // play note and speaker animation
  // - move into mesh.blast() function on speakers
  if (e.keyCode == 83) speakerActivated(scene.getObjectByName("speaker4")); // s
  if (e.keyCode == 81) speakerActivated(scene.getObjectByName("speaker1")); // q
  if (e.keyCode == 65) speakerActivated(scene.getObjectByName("speaker2")); // a
  if (e.keyCode == 87) speakerActivated(scene.getObjectByName("speaker3")); // w
});

// Ideas:
// Egyptian Hieroglyph Iconography
// Anubis, Jackal, Scarab Beetle, Cobra, Mummy, Falcon / Vulture
// Sphynx, Pharoah
// Eye of Horus / Ra
// http://en.wikipedia.org/wiki/Egyptian_hieroglyphs
