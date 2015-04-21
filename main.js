//lots o' globals - input scene and output scene should be easy to differentiate between
var camera, controls, renderer, scene, geometry, material, mesh;
var container;
var w = window.innerWidth;
var h = window.innerHeight;
var planeGeometry;
var mouseX, mouseY;
var time = 0.0;
var texCube;
var refractiveMaterial;
//kick things off 
var globalUniforms = {
    time: { type: 'f', value: time },
    resolution: { type: 'v2', value: new THREE.Vector2(w, h) },
    mouseX: { type: 'f', value: 0.0 },
    mouseY: { type: 'f', value: 0.0 }
}

initScene();

function initScene() {
    //input scene - basic three.js setup and loop functionality
    camera = new THREE.PerspectiveCamera(45, w / h, 1, 100000);
    camera.position.set(0, 0, 750);

    //orbit controls for input scene - make sure only input or output scene has controls, not both
    controls = new THREE.OrbitControls(camera);

    renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
    renderer.setSize(w, h);
    renderer.setClearColor(0xffffff, 1);
    renderer.setBlending(THREE.CustomBlending, THREE.SubtractEquation, THREE.DstColorFactor, THREE.SrcColorFactor);

    scene = new THREE.Scene();

    container = document.createElement('div');
    document.body.appendChild(container);
    container.appendChild(renderer.domElement);

    var urls = [];
    for (var i = 0; i < 6; i++) {
        var url = "assets/acid-rain-2k.jpg";
        urls.push(url);
    }
    reflectionCube = THREE.ImageUtils.loadTextureCube(urls, function() {});
    reflectionCube.format = THREE.RGBFormat;

    refractionCube = THREE.ImageUtils.loadTextureCube(urls, THREE.CubeRefractionMapping, function() {});

    refractiveMaterial = new THREE.MeshLambertMaterial({color: 0xffffff, envMap: refractionCube, side: THREE.DoubleSide, refractionRatio: 0.95});
    reflectiveMaterial = new THREE.MeshLambertMaterial({color: 0xffffff, envMap: reflectionCube, side: THREE.DoubleSide, reflectivity: 1.0 });

    initLights();
    initObjects();

    animate();

    //takes input scene and makes it a texture, as well as starting feedback loop
    // initOutputScene();
}
function initLights(){
    var ambient = new THREE.AmbientLight( 0xffffff );
    scene.add( ambient );

    pointLight = new THREE.PointLight( 0xffffff, 0.1 );
    scene.add( pointLight );

}
function initObjects(){
    manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {
        console.log( item, loaded, total );
    };
    loadModel("assets/obj/Null Gallery Meshes 2.obj", 0, 0, 0, 200.0, 0, 0, 0, refractiveMaterial);
    // loadModel("assets/obj/OBJ1.2.obj", 0, 0, 0, 200.0, 0, 0, 0, reflectiveMaterial);
    // loadModel("assets/obj/OBJ1.obj", 0, 0, 0, 200.0, 0, 0, 0, refractiveMaterial);
    // loadModel("assets/obj/OBJ2.obj", 0, 0, 0, 200.0, 0, 0, 0, reflectiveMaterial);
    // loadModel("assets/obj/OBJ3.1.obj", 0, 0, 0, 200.0, 0, 0, 0, refractiveMaterial);
    // loadModel("assets/obj/OBJ3.2.obj", 0, 0, 0, 200.0, 0, 0, 0, reflectiveMaterial);
    loadModel("assets/obj/Null Gallery Logo 2.obj", 0, 0, 0, 200.0, 0, 0, 0, new THREE.MeshBasicMaterial({color: 0x000000, side: 2}));

}
function animate() {
    window.requestAnimationFrame(animate);
    draw();
}

function draw() {

    pointLight.lookAt(0,0,0);
    renderer.render(scene, camera);
}

function map(value, max, minrange, maxrange) {
    return ((max - value) / (max)) * (maxrange - minrange) + minrange;
}

function onDocumentMouseMove(event) {
    unMappedMouseX = (event.clientX);
    unMappedMouseY = (event.clientY);
    mouseX = map(unMappedMouseX, window.innerWidth, -1.0, 1.0);
    mouseY = map(unMappedMouseY, window.innerHeight, -1.0, 1.0);
    globalUniforms.mouseX.value = mouseX;
    globalUniforms.mouseY.value = mouseY;
}

function onKeyDown(event) {
    if (event.keyCode == "32") {
        screenshot();

        function screenshot() {
            var blob = dataURItoBlob(outputRenderer.domElement.toDataURL('image/png'));
            var file = window.URL.createObjectURL(blob);
            var img = new Image();
            img.src = file;
            img.onload = function(e) {
                window.open(this.src);
            }
        }

        function dataURItoBlob(dataURI) {
            // convert base64/URLEncoded data component to raw binary data held in a string
            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0)
                byteString = atob(dataURI.split(',')[1]);
            else
                byteString = unescape(dataURI.split(',')[1]);

            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            // write the bytes of the string to a typed array
            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            return new Blob([ia], {
                type: mimeString
            });
        }

        function insertAfter(newNode, referenceNode) {
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        }
    }
}
function createModel(geometry, x, y, z, scale, rotX, rotY, rotZ, customMaterial){
        var material = customMaterial
        mesh = new THREE.Mesh(geometry, material);
        var scale = scale;
        mesh.position.set(x,y,z);
        mesh.scale.set(scale,scale,scale);
        mesh.rotation.set(rotX, rotY, rotZ);
        scene.add(mesh);
        shards.push(mesh);
    }

function loadModel(model, x, y, z, scale, rotX, rotY, rotZ, customMaterial){
    var loader = new THREE.OBJLoader( manager );
    loader.load( model, function ( object ) {

        object.traverse( function ( child ) {

            if ( child instanceof THREE.Mesh ) {

                child.material = customMaterial;
                // child.material.side = 2;
                // child.material.envMap = texCube;

            }

        } );
        object.scale.set(scale,scale,scale);
        scene.add( object );

    }, onProgress, onError );
}

function onProgress( xhr ) {
    if ( xhr.lengthComputable ) {
        var percentComplete = xhr.loaded / xhr.total * 100;
        console.log( Math.round(percentComplete, 2) + '% downloaded' );
    }
};

function onError( xhr ) {
};