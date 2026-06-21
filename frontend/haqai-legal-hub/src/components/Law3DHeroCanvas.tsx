import { useEffect, useRef } from "react";
import * as THREE from "three";

export function Law3DHeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any existing mounted canvases to prevent duplicates
    container.innerHTML = "";

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 11.2);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 4. Materials
    // Glassmorphic dark blue material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a, // dark navy
      metalness: 0.1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.6,
      transmission: 0.9, // high transmission for refraction
      ior: 1.5,
      thickness: 1.2,
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0xc9a84c), // gold highlights
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    // Premium Gold material
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xc9a84c,
      metalness: 0.9,
      roughness: 0.15,
    });

    // Main Group
    const mainGroup = new THREE.Group();
    mainGroup.scale.set(0.88, 0.88, 0.88);
    scene.add(mainGroup);

    // Scale of Justice Group
    const scalesGroup = new THREE.Group();
    scalesGroup.position.set(1.2, 0.2, 0);
    mainGroup.add(scalesGroup);

    // 5. Constructing the 3D Scale of Justice
    // Base steps
    const baseGeo1 = new THREE.CylinderGeometry(1.2, 1.3, 0.15, 32);
    const base1 = new THREE.Mesh(baseGeo1, glassMaterial);
    base1.position.y = -2.2;
    scalesGroup.add(base1);

    const baseGeo2 = new THREE.CylinderGeometry(0.9, 1.0, 0.15, 32);
    const base2 = new THREE.Mesh(baseGeo2, glassMaterial);
    base2.position.y = -2.05;
    scalesGroup.add(base2);

    // Column
    const pillarGeo = new THREE.CylinderGeometry(0.12, 0.18, 4.0, 16);
    const pillar = new THREE.Mesh(pillarGeo, glassMaterial);
    pillar.position.y = 0;
    scalesGroup.add(pillar);

    // Center gold ornament on pillar
    const centerRingGeo = new THREE.TorusGeometry(0.2, 0.06, 12, 24);
    const centerRing = new THREE.Mesh(centerRingGeo, goldMaterial);
    centerRing.rotation.x = Math.PI / 2;
    centerRing.position.y = 1.0;
    scalesGroup.add(centerRing);

    // Top ornament
    const topTipGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const topTip = new THREE.Mesh(topTipGeo, goldMaterial);
    topTip.position.y = 2.1;
    scalesGroup.add(topTip);

    // Crossbeam
    const beamGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.8, 16);
    const beam = new THREE.Mesh(beamGeo, glassMaterial);
    beam.rotation.z = Math.PI / 2;
    beam.position.y = 1.6;
    scalesGroup.add(beam);

    // Gold beam ends and pivot points
    const beamLeftEnd = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), goldMaterial);
    beamLeftEnd.position.set(-1.9, 1.6, 0);
    scalesGroup.add(beamLeftEnd);

    const beamRightEnd = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), goldMaterial);
    beamRightEnd.position.set(1.9, 1.6, 0);
    scalesGroup.add(beamRightEnd);

    // Dynamic Scale hanger groups to sway slightly
    const leftScaleAssembly = new THREE.Group();
    leftScaleAssembly.position.set(-1.9, 1.6, 0);
    scalesGroup.add(leftScaleAssembly);

    const rightScaleAssembly = new THREE.Group();
    rightScaleAssembly.position.set(1.9, 1.6, 0);
    scalesGroup.add(rightScaleAssembly);

    // Strings/Hangers (using fine gold cylinders)
    const stringGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.5, 8);
    
    // Left hangers
    const leftStrut1 = new THREE.Mesh(stringGeo, goldMaterial);
    leftStrut1.position.set(-0.25, -0.75, 0);
    leftStrut1.rotation.z = -0.15;
    leftScaleAssembly.add(leftStrut1);

    const leftStrut2 = new THREE.Mesh(stringGeo, goldMaterial);
    leftStrut2.position.set(0.25, -0.75, 0);
    leftStrut2.rotation.z = 0.15;
    leftScaleAssembly.add(leftStrut2);

    // Right hangers
    const rightStrut1 = new THREE.Mesh(stringGeo, goldMaterial);
    rightStrut1.position.set(-0.25, -0.75, 0);
    rightStrut1.rotation.z = -0.15;
    rightScaleAssembly.add(rightStrut1);

    const rightStrut2 = new THREE.Mesh(stringGeo, goldMaterial);
    rightStrut2.position.set(0.25, -0.75, 0);
    rightStrut2.rotation.z = 0.15;
    rightScaleAssembly.add(rightStrut2);

    // Scale plates
    const plateGeo = new THREE.CylinderGeometry(0.65, 0.6, 0.06, 24);
    
    const leftPlate = new THREE.Mesh(plateGeo, glassMaterial);
    leftPlate.position.y = -1.5;
    leftScaleAssembly.add(leftPlate);
    
    const leftPlateRing = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.03, 8, 24), goldMaterial);
    leftPlateRing.rotation.x = Math.PI / 2;
    leftPlateRing.position.y = -1.5;
    leftScaleAssembly.add(leftPlateRing);

    const rightPlate = new THREE.Mesh(plateGeo, glassMaterial);
    rightPlate.position.y = -1.5;
    rightScaleAssembly.add(rightPlate);

    const rightPlateRing = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.03, 8, 24), goldMaterial);
    rightPlateRing.rotation.x = Math.PI / 2;
    rightPlateRing.position.y = -1.5;
    rightScaleAssembly.add(rightPlateRing);

    // 6. Secondary Floating Gavel
    const gavelGroup = new THREE.Group();
    gavelGroup.position.set(-2.2, -1.2, 0.5);
    gavelGroup.scale.set(0.6, 0.6, 0.6);
    mainGroup.add(gavelGroup);

    // Gavel Sound Block
    const blockGeo = new THREE.CylinderGeometry(0.8, 0.9, 0.25, 16);
    const block = new THREE.Mesh(blockGeo, glassMaterial);
    block.position.y = -0.6;
    gavelGroup.add(block);
    
    const blockRing = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.04, 8, 24), goldMaterial);
    blockRing.rotation.x = Math.PI / 2;
    blockRing.position.y = -0.6;
    gavelGroup.add(blockRing);

    // Gavel Head
    const headGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.0, 16);
    const head = new THREE.Mesh(headGeo, glassMaterial);
    head.rotation.z = Math.PI / 2;
    gavelGroup.add(head);

    // Gavel Head Gold Bands
    const bandGeo = new THREE.TorusGeometry(0.36, 0.03, 8, 24);
    const band1 = new THREE.Mesh(bandGeo, goldMaterial);
    band1.rotation.y = Math.PI / 2;
    band1.position.x = -0.3;
    gavelGroup.add(band1);

    const band2 = new THREE.Mesh(bandGeo, goldMaterial);
    band2.rotation.y = Math.PI / 2;
    band2.position.x = 0.3;
    gavelGroup.add(band2);

    // Gavel Handle
    const handleGeo = new THREE.CylinderGeometry(0.08, 0.06, 1.8, 12);
    const handle = new THREE.Mesh(handleGeo, glassMaterial);
    handle.position.y = -0.55;
    handle.rotation.z = -0.2;
    gavelGroup.add(handle);

    const handleTip = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), goldMaterial);
    handleTip.position.set(-0.1, -1.45, 0);
    gavelGroup.add(handleTip);

    // Tilt gavel slightly for dynamic look
    gavelGroup.rotation.set(0.3, -0.4, 0.2);

    // 7. Stack of Books
    const booksGroup = new THREE.Group();
    booksGroup.position.set(-2.0, 1.5, -0.5);
    booksGroup.scale.set(0.65, 0.65, 0.65);
    mainGroup.add(booksGroup);

    // Book 1 (bottom)
    const book1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.28, 1.2), glassMaterial);
    book1.position.y = -0.3;
    booksGroup.add(book1);
    const book1Gold = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.29, 1.21), goldMaterial);
    book1Gold.position.x = -0.76;
    booksGroup.add(book1Gold);

    // Book 2 (middle - slightly rotated)
    const book2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.26, 1.1), glassMaterial);
    book2.position.y = 0;
    book2.rotation.y = 0.15;
    booksGroup.add(book2);
    const book2Gold = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.27, 1.11), goldMaterial);
    book2Gold.position.set(-0.71, 0, 0.05);
    book2Gold.rotation.y = 0.15;
    booksGroup.add(book2Gold);

    // Book 3 (top)
    const book3 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.24, 1.05), glassMaterial);
    book3.position.y = 0.26;
    book3.rotation.y = -0.1;
    booksGroup.add(book3);
    const book3Gold = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.25, 1.06), goldMaterial);
    book3Gold.position.set(-0.66, 0.26, -0.05);
    book3Gold.rotation.y = -0.1;
    booksGroup.add(book3Gold);

    // Tilt the books group slightly
    booksGroup.rotation.set(0.25, 0.3, -0.1);

    // 8. Particles System (Ambient Gold Stars)
    const particleCount = 65;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      // spread particles over a volume
      positions[i * 3] = (Math.random() - 0.5) * 12; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6; // z
      speeds.push(0.005 + Math.random() * 0.008);
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    
    // soft glowing particle texture
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, "rgba(201, 168, 76, 1)");
      grad.addColorStop(0.3, "rgba(201, 168, 76, 0.8)");
      grad.addColorStop(1, "rgba(201, 168, 76, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.15,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 9. Lighting
    // Ambient
    const ambientLight = new THREE.AmbientLight(0x0a0f1e, 1.2);
    scene.add(ambientLight);

    // Navy fill light
    const fillLight = new THREE.DirectionalLight(0x1e293b, 1.5);
    fillLight.position.set(-5, 3, -2);
    scene.add(fillLight);

    // Golden Rim Light (key light)
    const goldRimLight = new THREE.DirectionalLight(0xc9a84c, 3.5);
    goldRimLight.position.set(5, 5, 2);
    scene.add(goldRimLight);

    // Subtle point light right in front of scales
    const pointLight = new THREE.PointLight(0xc9a84c, 1.5, 10);
    pointLight.position.set(1.5, 0.5, 1.5);
    scene.add(pointLight);

    // 10. Mouse Move Listener
    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect) return;
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Target rotation (max 7 degrees / ~0.12 radians)
      targetRotation.current.x = y * 0.07;
      targetRotation.current.y = x * 0.08;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 11. Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Main rotation
      scalesGroup.rotation.y = elapsedTime * 0.12;
      
      // Floating motions
      scalesGroup.position.y = 0.2 + Math.sin(elapsedTime * 0.8) * 0.12;
      gavelGroup.position.y = -1.2 + Math.sin(elapsedTime * 1.1 + 1.0) * 0.08;
      booksGroup.position.y = 1.5 + Math.sin(elapsedTime * 0.6 + 2.0) * 0.08;

      // Subtle scale balance sway
      leftScaleAssembly.rotation.z = Math.sin(elapsedTime * 1.5) * 0.03;
      rightScaleAssembly.rotation.z = Math.sin(elapsedTime * 1.5) * 0.03;

      // Particle float up
      const posArr = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        posArr[i * 3 + 1] += speeds[i]; // float up
        if (posArr[i * 3 + 1] > 4) {
          posArr[i * 3 + 1] = -4; // reset to bottom
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Mouse Parallax smooth lerp
      mouse.current.x += (targetRotation.current.y - mouse.current.x) * 0.05;
      mouse.current.y += (targetRotation.current.x - mouse.current.y) * 0.05;

      mainGroup.rotation.y = mouse.current.x;
      mainGroup.rotation.x = -mouse.current.y;

      renderer.render(scene, camera);
    };

    animate();

    // 12. Handle Resize
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[450px] md:min-h-[600px] relative pointer-events-auto select-none"
    />
  );
}
