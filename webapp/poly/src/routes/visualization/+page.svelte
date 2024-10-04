<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let container: HTMLElement;

	// 설정 가능한 옵션들
	const options = {
		cubeColor: 0x00ff00,
		edgeColor: 0xffffff,
		edgeThickness: 0.005,
		backgroundColor: 0x111111,
		ambientLightIntensity: 0.6, // 환경광 강도 증가
		directionalLightIntensity: 0.5,
		pointLightIntensity: 0.3,
		cubeSizeRatio: 0.2
	};

	async function loadDependencies() {
		const [THREE, { OrbitControls }] = await Promise.all([
			import('three'),
			import('three/examples/jsm/controls/OrbitControls.js')
		]);

		return { THREE, OrbitControls };
	}

	function createScene(THREE) {
		const scene = new THREE.Scene();
		scene.background = new THREE.Color(options.backgroundColor);
		return scene;
	}

	function createCamera(THREE, aspect) {
		return new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
	}

	function createRenderer(THREE, container) {
		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: false
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
		container.appendChild(renderer.domElement);
		return renderer;
	}

	function createTextTexture(THREE, text, size = 256, color = '#ffffff', backgroundColor = null) {
		const canvas = document.createElement('canvas');
		canvas.width = size;
		canvas.height = size;
		const context = canvas.getContext('2d');

		// 배경을 투명하게 설정
		context.clearRect(0, 0, size, size);

		// 텍스트 그리기
		context.font = `bold ${size / 2}px Arial`;
		context.fillStyle = color;
		context.textAlign = 'center';
		context.textBaseline = 'middle';

		// 텍스트에 외곽선 추가
		context.strokeStyle = '#000000';
		context.lineWidth = size / 16;
		context.strokeText(text, size / 2, size / 2);
		context.fillText(text, size / 2, size / 2);

		return new THREE.CanvasTexture(canvas);
	}

	function createCube(THREE) {
		const geometry = new THREE.BoxGeometry(1, 1, 1);
		const material = new THREE.MeshLambertMaterial({
			color: options.cubeColor,
			transparent: true,
			opacity: 0.8 // 약간의 투명도 추가
		});
		const cube = new THREE.Mesh(geometry, material);

		const textures = [
			createTextTexture(THREE, '1'),
			createTextTexture(THREE, '2'),
			createTextTexture(THREE, '3'),
			createTextTexture(THREE, '4'),
			createTextTexture(THREE, '5'),
			createTextTexture(THREE, '6')
		];

		textures.forEach((texture, index) => {
			const planeMaterial = new THREE.MeshBasicMaterial({
				map: texture,
				transparent: true,
				side: THREE.DoubleSide
			});
			const planeGeometry = new THREE.PlaneGeometry(0.9, 0.9);
			const plane = new THREE.Mesh(planeGeometry, planeMaterial);

			// 각 면의 중앙에 평면 위치 조정
			switch (index) {
				case 0:
					plane.position.set(0, 0, 0.501);
					break; // 앞
				case 1:
					plane.position.set(0, 0, -0.501);
					plane.rotation.y = Math.PI;
					break; // 뒤
				case 2:
					plane.position.set(0, 0.501, 0);
					plane.rotation.x = -Math.PI / 2;
					break; // 위
				case 3:
					plane.position.set(0, -0.501, 0);
					plane.rotation.x = Math.PI / 2;
					break; // 아래
				case 4:
					plane.position.set(0.501, 0, 0);
					plane.rotation.y = Math.PI / 2;
					break; // 오른쪽
				case 5:
					plane.position.set(-0.501, 0, 0);
					plane.rotation.y = -Math.PI / 2;
					break; // 왼쪽
			}

			cube.add(plane);
		});

		return cube;
	}

	function createPreciseEdges(THREE, geometry, thickness, color) {
		const edgesGeometry = new THREE.EdgesGeometry(geometry);
		const positions = edgesGeometry.attributes.position.array;
		const edgeGroup = new THREE.Group();

		for (let i = 0; i < positions.length; i += 6) {
			const start = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
			const end = new THREE.Vector3(positions[i + 3], positions[i + 4], positions[i + 5]);

			const direction = end.clone().sub(start);
			const length = direction.length();
			direction.normalize();

			const edgeGeometry = new THREE.BoxGeometry(thickness, thickness, length);
			const edgeMaterial = new THREE.MeshBasicMaterial({ color: color });
			const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);

			edge.position.copy(start).add(end).multiplyScalar(0.5);
			edge.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);

			edgeGroup.add(edge);
		}

		return edgeGroup;
	}

	function createLights(THREE, scene) {
		const ambientLight = new THREE.AmbientLight(0xffffff, options.ambientLightIntensity);
		scene.add(ambientLight);

		const directionalLight1 = new THREE.DirectionalLight(
			0xffffff,
			options.directionalLightIntensity
		);
		directionalLight1.position.set(5, 5, 5);
		scene.add(directionalLight1);

		const directionalLight2 = new THREE.DirectionalLight(
			0xffffff,
			options.directionalLightIntensity
		);
		directionalLight2.position.set(-5, -5, -5);
		scene.add(directionalLight2);

		const pointLight1 = new THREE.PointLight(0xffffff, options.pointLightIntensity);
		pointLight1.position.set(10, 10, 10);
		scene.add(pointLight1);

		const pointLight2 = new THREE.PointLight(0xffffff, options.pointLightIntensity);
		pointLight2.position.set(-10, -10, -10);
		scene.add(pointLight2);

		// 추가 광원
		const pointLight3 = new THREE.PointLight(0xffffff, options.pointLightIntensity);
		pointLight3.position.set(10, -10, 10);
		scene.add(pointLight3);

		const pointLight4 = new THREE.PointLight(0xffffff, options.pointLightIntensity);
		pointLight4.position.set(-10, 10, -10);
		scene.add(pointLight4);
	}

	function createEnvironmentMap(THREE, scene, renderer) {
		const pmremGenerator = new THREE.PMREMGenerator(renderer);
		const envTexture = new THREE.CubeTextureLoader().load([
			'px.jpg',
			'nx.jpg',
			'py.jpg',
			'ny.jpg',
			'pz.jpg',
			'nz.jpg'
		]);
		const envMap = pmremGenerator.fromCubemap(envTexture).texture;
		scene.environment = envMap;
		pmremGenerator.dispose();
	}

	function updateCubeSize(cube, camera, controls) {
		const minDimension = Math.min(window.innerWidth, window.innerHeight);
		const cubeSize = minDimension * options.cubeSizeRatio;
		cube.scale.set(cubeSize, cubeSize, cubeSize);
		camera.position.z = cubeSize * 3; // 카메라 위치를 약간 더 멀리 조정
		controls.update();
	}

	function initThreeJS(THREE, OrbitControls) {
		const scene = createScene(THREE);
		const camera = createCamera(THREE, window.innerWidth / window.innerHeight);
		const renderer = createRenderer(THREE, container);
		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.25;
		controls.enableZoom = true;

		createLights(THREE, scene); // 광원을 먼저 생성하고 씬에 추가

		const cubeGroup = new THREE.Group(); // 큐브와 모서리를 포함할 그룹 생성
		scene.add(cubeGroup);

		const cube = createCube(THREE);
		cubeGroup.add(cube);

		const preciseEdges = createPreciseEdges(
			THREE,
			cube.geometry,
			options.edgeThickness,
			options.edgeColor
		);
		cubeGroup.add(preciseEdges);

		function animate() {
			requestAnimationFrame(animate);
			controls.update();
			renderer.render(scene, camera);
		}

		function onWindowResize() {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
			updateCubeSize(cubeGroup, camera, controls);
		}

		updateCubeSize(cubeGroup, camera, controls);
		animate();

		window.addEventListener('resize', onWindowResize);

		return () => {
			window.removeEventListener('resize', onWindowResize);
			container.removeChild(renderer.domElement);
			controls.dispose();
		};
	}

	onMount(async () => {
		if (browser) {
			const deps = await loadDependencies();
			initThreeJS(deps.THREE, deps.OrbitControls);
		}
	});
</script>

<div bind:this={container}></div>

<style lang="scss">
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
		border: none;
	}

	div {
		width: 100%;
		height: 100vh;
		overflow: hidden;
	}
</style>
