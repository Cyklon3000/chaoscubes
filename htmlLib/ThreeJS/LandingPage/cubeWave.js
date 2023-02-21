import '/htmlLib/ThreeJS/LandingPage/cubeWave.css';
import * as THREE from 'three';

function Vector2(x, y)
{
    this.x = x;
    this.y = y;
}

function Vector3(x, y, z)
{
    this.x = x;
    this.y = y;
    this.z = z;
}

function lerp(start, end, amt)
{
    return (1 - amt) * start + amt * end;
}

// Standard Normal variate using Box-Muller transform. [@Maxwell Collard + @joe; https://stackoverflow.com/questions/25582882]
function gaussianRandom(mean = 0, stdev = 1)
{
    let u = 1 - Math.random(); //Converting [0,1) to (0,1)
    let v = Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}

function setupNewCube(newCube)
{
    newCube.randomizeMesh();
    pathCubes.push(newCube);
}

function calculateSquareAmount(minVerticalSquares = 15, maxSquareSize = 50)
{
    let verticalSquares = Math.ceil(window.innerHeight / maxSquareSize);

    verticalSquares = Math.max(verticalSquares, minVerticalSquares);
    let verticalSquareSize = window.innerHeight / verticalSquares;

    let horizontalSquares = Math.round(window.innerWidth / verticalSquareSize);
    let horizontalSquareSize = window.innerWidth / horizontalSquares;

    return new Vector2(horizontalSquares, verticalSquares);
}

function setupNewBackgroundSquare(newSquare, squareSize, x, y)
{
    // Generatze Mesh
    let geometry = new THREE.PlaneGeometry(squareSize.x, squareSize.y, 1, 1);
    let material = new THREE.MeshBasicMaterial
        ({
            color: 0xff0000,
            wireframe: true
        }); // materials.color(newSquare.unlitSquareColor);
    let squareMesh = new THREE.Mesh(geometry, material);

    backgroundScene.add(squareMesh); // Add mesh to background scene  
    newSquare.mesh = squareMesh;

    // set square position
    newSquare.mesh.position.x = x * squareSize.x + (squareSize.x / 2);
    newSquare.mesh.position.y = y * squareSize.y + (squareSize.y / 2);

    backgroundSquares.push(newSquare);
}

function fillBackgroundWithSquares()
{
    backgroundSquares = [];
    let squareAmount = calculateSquareAmount();
    let squareSize = new Vector2(window.innerWidth / squareAmount.x, window.innerHeight / squareAmount.y);
    console.log("ScreenSize: x:" + window.innerWidth + " | y:" + window.innerHeight);
    console.log("BackgroundSquare Size: x:" + squareSize.x.toFixed(2) + " | y:" + squareSize.y.toFixed(2));
    console.log("BackgroundSquare Amount: x:" + squareAmount.x + " | y:" + squareAmount.y)

    for (let y = 0; y < squareAmount.y; y += 1)
    {
        for (let x = 0; x < squareAmount.x; x += 1)
        {
            let square = new backgroundSquare()
            setupNewBackgroundSquare(square, squareSize, x, y)
        }
    }
}

// Objects hold information about a custom configurable function and are able to output information about it 
function SinPath(leftHeight, rightHeight, maxHeight, startTPos = -0.25, endTPos = 1.25, falloffStrength = 2)
{
    this.leftHeight = leftHeight;
    this.rightHeight = rightHeight;
    this.maxHeight = maxHeight;
    this.startTPos = startTPos;
    this.endTPos = endTPos;
    this.falloffStrength = falloffStrength;

    // Different parts of function for better understanding
    // Scaled sin() with frequency 1
    this.wave = function (t)
    {
        return Math.sin(2 * Math.PI * t) * this.maxHeight;
    };
    // Slope that hits (x | height) and (1, 0) passed through falloff
    this.leftHeightSetter = function (t)
    {
        return -(t - 1) * this.leftHeight * Math.pow(t - 1, this.falloffStrength);
    };
    // Slope that hits (x | height) and (0, 0) passed through falloff
    this.rightHeightSetter = function (t)
    {
        return t * this.rightHeight * Math.pow(t, this.falloffStrength);
    };
    // then translate function to mostly take place inside the unit square
    // Takes base sin() and adjust it, so t=0 and t=1 hit the set heights,
    this.getTValue = function (t)
    {
        return (this.wave(t) + this.leftHeightSetter(t) + this.rightHeightSetter(t)) / 2 + 0.5;
    };

    // Derivative of path function gets slope at t (Dont try to understand formula!)
    this.getCurrentSlope = function (t)
    {
        return 0.5 * (-this.falloffStrength * this.leftHeight * t * Math.pow(t - 1, this.falloffStrength - 1) + this.falloffStrength * this.rightHeight * Math.pow(t, this.falloffStrength) + this.falloffStrength * this.leftHeight * Math.pow(t - 1, this.falloffStrength - 1) - this.leftHeight * Math.pow(t - 1, this.falloffStrength) + this.rightHeight * Math.pow(t, this.falloffStrength) + 2 * this.maxHeight * Math.PI * Math.cos(2 * Math.PI * t));
    };
    // Aproximate length of path, in order to set exact cube on screen time through cube speed
    this.getPathLength = function (steps = 20)
    {
        let length = 0;
        let lastTPoint = new Vector2(0, this.leftHeight);
        for (let i = 0; i < steps; i += 1)
        {
            let tPos = lerp(0, 1, i / steps) + (1 / steps);
            let tPoint = new Vector2(tPos, this.getTValue(tPos));
            length += Math.hypot(tPoint.x - lastTPoint.x, tPoint.y - lastTPoint.y);
            lastTPoint = tPoint;
        }
        return length;
    };
    this.pathLength = this.getPathLength();
}

function GetMaterial()
{
    this.baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x00FF00,
        roughness: 0
    })

    this.materialOptions = [
        new THREE.MeshStandardMaterial({
            color: 0xF651D7,
            roughness: 0
        }),
        new THREE.MeshStandardMaterial({
            color: 0xD346D4,
            roughness: 0
        }),
        new THREE.MeshStandardMaterial({
            color: 0xD959EB,
            roughness: 0
        }),
        new THREE.MeshStandardMaterial({
            color: 0xB54AD4,
            roughness: 0
        }),
        new THREE.MeshStandardMaterial({
            color: 0xC159F6,
            roughness: 0
        })
    ]

    this.random = function ()
    {
        let randomIndex = Math.floor(this.materialOptions.length * Math.random());
        return this.materialOptions[randomIndex];
    }

    this.randomColor = function ()
    {
        let randomIndex = Math.floor(this.materialOptions.length * Math.random());
        let randomMaterial = this.materialOptions[randomIndex];
        return randomMaterial.color;
    }

    this.color = function (color)
    {
        let material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0
        })
        return material;
    }
}

// Creates Object that holds mesh data about the cube and data that are needed to calculate future mesh data changes
function Cube(cubeIndex, tPos)
{
    this.cubeIndex = cubeIndex;
    this.tPos = tPos;

    this.updatePos = function ()
    {
        this.mesh.position.x = (1 - this.tPos) * window.innerWidth + this.posOffset.x;
        this.mesh.position.y = (1 - cubePath.getTValue(1 - this.tPos)) * window.innerHeight + this.posOffset.y;
        this.mesh.position.z = this.posOffset.z;
    };

    this.updateRotation = function (deltaTime)
    {
        this.mesh.rotation.x += this.rotationVelocity.x * (2 * Math.PI) * deltaTime;
        this.mesh.rotation.y += this.rotationVelocity.y * (2 * Math.PI) * deltaTime;
        this.mesh.rotation.z += this.rotationVelocity.z * (2 * Math.PI) * deltaTime;
    }

    this.isPartOfScene = true;
    // Updates the time value of the cube (each cubes position is calculeted respective to their current time Position)
    this.updateTPos = function (deltaTime)
    {
        // Update cubeIndex
        this.cubeIndex = pathCubes.indexOf(this);

        // Calculate speed up (Higer when page just loaded)
        let initialSpeedMultipier = (20 - 1) * Math.pow(1.75, -clock.getElapsedTime()) + 1; // (Speed increase - 1) * fallofSpeed^-elapsedTimeSincePageLoaded + 1
        // factor in pathLength (because pathLength != 1) and scale by cube Speed and initialSpeedup
        let speedMultipier = cubePath.pathLength * this.cubeSpeed * initialSpeedMultipier;
        // Adjust for slope (higer slope -> lower speed)
        this.tPos += deltaTime / Math.sqrt(1 + Math.pow(cubePath.getCurrentSlope(this.tPos), 2)) * speedMultipier;

        // Reset tPos when reached endTPos
        if (this.tPos > cubePath.endTPos)
        {
            // Delete object if there already are to many
            if (pathCubes.length > cubeAmount)
            {
                this.mesh.position.y -= 10000;
                this.isPartOfScene = false;
                return
            }
            this.tPos -= cubePath.endTPos - cubePath.startTPos;
            this.randomizeMesh();
            this.randomizeOffset();
            this.randomizeRotationVelocity();
            this.randomizeCubeSpeed();
        }
    };

    // Randomizes mesh size (typically called when cube reaches endTPos)
    // TODO: Add material randomization
    this.randomizeMesh = function (baseValue = 50, randomizationRange = 10)
    {
        let size = baseValue + (Math.random() * 2 - 1) * randomizationRange;
        let geometry = new THREE.BoxGeometry(size, size, size, 1, 1, 1);
        this.mesh = new THREE.Mesh(geometry, materials.random());
        cubeScene.add(this.mesh)
    }

    this.randomizeOffset = function (offsetMultiplier = new Vector2(100, 100))
    {
        return new Vector3(
            Math.abs(gaussianRandom() / 1) * offsetMultiplier.x,
            (gaussianRandom() / 1.5) * offsetMultiplier.y,
            this.cubeIndex * 100 + 500
        );
    }
    this.posOffset = this.randomizeOffset();

    this.randomizeRotationVelocity = function (baseValue = 0.05, randomizationRange = 0.05)
    {
        return new Vector3(
            baseValue + (Math.random() * 2 - 1) * randomizationRange,
            baseValue + (Math.random() * 2 - 1) * randomizationRange,
            baseValue + (Math.random() * 2 - 1) * randomizationRange
        );
    }
    this.rotationVelocity = this.randomizeRotationVelocity();

    this.randomizeCubeSpeed = function (baseValue = 0.03, randomizationRange = 0.015)
    {
        return baseValue + (Math.random() * 2 - 1) * randomizationRange;
    }
    this.cubeSpeed = this.randomizeCubeSpeed()
};

function backgroundSquare(unlitSquareColor = 0xFF1414)
{
    this.unlitSquareColor = unlitSquareColor;
    this.litSquareColor = materials.randomColor();
    this.mesh;

    this.updateMesh = function ()
    {
        this.mesh.material.color.setHex(0x362453);
    }
}

// Create scene
const cubeScene = new THREE.Scene(); // cube scene
const backgroundScene = new THREE.Scene(); // background scene

// Setup cube camera and canvas
const cubeCamera = new THREE.OrthographicCamera(0, window.innerWidth, 0, window.innerHeight, 0.1, 1000000);
const cubeRenderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#cubes'),
    alpha: true
});
cubeRenderer.setPixelRatio(window.devicePixelRatio);
cubeRenderer.setSize(window.innerWidth, window.innerHeight);
cubeRenderer.setClearColor(0x000000, 0);

// Setup background camera and canvas
const backgroundCamera = new THREE.OrthographicCamera(0, window.innerWidth, 0, window.innerHeight, 0.1, 2)
backgroundCamera.position.z = 1;
const backgroundRenderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#background')
})
backgroundRenderer.setPixelRatio(window.devicePixelRatio);
backgroundRenderer.setSize(window.innerWidth, window.innerHeight);

// Setup light
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1)
directionalLight.position.set(0, 0, -1)
cubeScene.add(directionalLight);
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1);
backgroundScene.add(ambientLight);

const materials = new GetMaterial();

// Create path cubes
var pathCubes = []
var cubeAmount = Math.round(window.innerWidth / 40);
var hasCubeAmountChanged;
var recentPathCubesListLength;
cubeCamera.position.z = cubeAmount * 100 + 1000; // All cubes are positioned behind each other, so they dont colide
const cubePath = new SinPath(-0.35, 0.5, 0.4);
var cubeIndex = 0;
for (cubeIndex = 0; cubeIndex < cubeAmount; cubeIndex += 1)
{
    let tPos = lerp(cubePath.startTPos, cubePath.endTPos, cubeIndex / cubeAmount); // Distribute tPos equally
    tPos -= cubePath.endTPos // Move cubes bejoind start position, so they fly in initially

    let pathCube = new Cube(cubeIndex, tPos);
    setupNewCube(pathCube);
}

// Create background squares
var backgroundSquares;
fillBackgroundWithSquares()

// Called each frame
var clock = new THREE.Clock();

function animate()
{
    requestAnimationFrame(animate);
    var deltaTime = clock.getDelta();

    recentPathCubesListLength = pathCubes.length;
    // console.log(Math.round(pathCubes[0].mesh.position.x) + " | " +
    // Math.round(pathCubes[0].mesh.position.y) + " | " +
    // Math.round(pathCubes[0].mesh.position.z) + " <- " +
    // Math.round(pathCubes[0].tPos * 100) / 100);
    // Update data of cubes
    pathCubes.forEach(cube =>
    {
        if (!cube.isPartOfScene)
        {
            // Remove mesh out of scene (last frame moved up 10000)
            cubeScene.remove(cube.mesh);
            cube.mesh = undefined;
            // cube.mesh.geometry.dispose();
            // cube.mesh.material.dispose();
            pathCubes.splice(cube.cubeIndex, 1);
            return;
        }
        cube.updateTPos(deltaTime);
        if (cube.mesh == undefined) { return }
        cube.updatePos();
        cube.updateRotation(deltaTime);

        // Fix because of flickering cubes in the top right (Quickfix!)
        if (cube.mesh.position.x == 0 && cube.mesh.position.x == 0)
        {
            cube.mesh.position.y -= 100000;
        }
    });

    backgroundSquares.forEach(square =>
    {
        square.updateMesh();
    });

    windowResize(deltaTime)

    // Create new cubes if there is a insuficcient amount of them
    while (pathCubes.length < cubeAmount)
    {
        let tPos = Math.random() - cubePath.endTPos;

        cubeIndex = pathCubes.length
        let pathCube = new Cube(cubeIndex, tPos);
        setupNewCube(pathCube);
    }

    if (hasCubeAmountChanged || recentPathCubesListLength != pathCubes.length)
    {
        console.log("CubeAmount: " + pathCubes.length + "/" + cubeAmount);
    }

    cubeRenderer.render(cubeScene, cubeCamera); // Updates canvas
    backgroundRenderer.render(backgroundScene, backgroundCamera); // Update background
}

var latestWindowSize = new Vector2(window.innerWidth, window.innerHeight);
var updateWindowSize = false;
var timeSinceResize = 0;

function windowResize(deltaTime)
{
    // If window has been resized wait 0.25 seconds until updating everything
    if ((latestWindowSize.x != window.innerWidth) || (latestWindowSize.y != window.innerHeight))
    {
        timeSinceResize = 0;
        updateWindowSize = true;
        latestWindowSize = new Vector2(window.innerWidth, window.innerHeight);
        return;
    }
    if (timeSinceResize < 0.25)
    {
        timeSinceResize += deltaTime;
        return;
    }
    if (!updateWindowSize) {
        return;
    }
    updateWindowSize = false;

    // Set new target value for cubes based on window width
    hasCubeAmountChanged = cubeAmount != Math.round(window.innerWidth / 40)
    cubeAmount = Math.round(window.innerWidth / 40)

    // Update background squares
    backgroundSquares.forEach(square =>
    {
        backgroundScene.remove(square.mesh);
    });
    fillBackgroundWithSquares()

    // Resize render region
    cubeCamera.left = 0;
    cubeCamera.right = window.innerWidth;
    cubeCamera.top = 0;
    cubeCamera.bottom = window.innerHeight;
    cubeCamera.updateProjectionMatrix();
    backgroundCamera.left = 0;
    backgroundCamera.right = window.innerWidth;
    backgroundCamera.top = 0;
    backgroundCamera.bottom = window.innerHeight;
    backgroundCamera.updateProjectionMatrix();

    cubeRenderer.setSize(window.innerWidth, window.innerHeight);
    backgroundRenderer.setSize(window.innerWidth, window.innerHeight);
}

animate()