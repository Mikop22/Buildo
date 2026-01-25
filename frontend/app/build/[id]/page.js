'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { 
  generateProject, 
  generateAssemblyImages, 
  buildReferenceImages,
  extractModuleNames 
} from '@/lib/api';
import { ProjectProvider } from '@/app/context/ProjectContext';
import GameDashboard from '@/app/components/GameDashboard';
import PixelBackground from '@/app/components/PixelBackground';
import styles from './page.module.css';

export default function BuildPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState('Initializing...');
  const [error, setError] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate execution in StrictMode
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    
    async function loadProject() {
      // Get description from localStorage (saved by landing page)
      const savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
      const project = savedProjects.find(p => p.id === id);
      const description = project?.name || id.replace(/-/g, ' ');

      try {
        // 1. Call /generate to get parts and assembly steps
        setLoadingStage('Generating parts list...');
        const data = await generateProject(description);
        
        // 2. Build reference images (download + base64 encode via proxy)
        setLoadingStage('Processing reference images...');
        let referenceImages = [];
        try {
          referenceImages = await buildReferenceImages(data);
        } catch (imgErr) {
          console.warn('Could not build reference images:', imgErr.message);
          // Continue without reference images
        }
        
        // 3. Build steps payload
        const steps = (data.assembly_steps || []).map((s, i) => ({
          id: i + 1,
          human_description: s
        }));
        
        // 4. Call /v1/assembly-images if we have steps
        let stepImages = [];
        if (steps.length > 0) {
          setLoadingStage('Generating step images...');
          try {
            const stepImagesResponse = await generateAssemblyImages({
              project_id: id,
              title: description,
              scene: { modules: extractModuleNames(data) },
              reference_images: referenceImages,
              steps
            });
            stepImages = stepImagesResponse.images || [];
          } catch (stepErr) {
            console.warn('Could not generate step images:', stepErr.message);
            // Continue without step images
          }
        }

        setProjectData({
          description,
          parts: data,
          assemblySteps: data.assembly_steps || [],
          assembledProductImage: data.assembled_product_image?.imageUrl,
          stepImages
        });
      } catch (err) {
        console.error('Project loading error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadProject();
  }, [id]);

  if (loading) {
    return <LoadingScreen stage={loadingStage} />;
  }
  
  if (error) {
    return <ErrorScreen error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <>
      <PixelBackground variant="tech" />
      <ProjectProvider initialData={projectData}>
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <GameDashboard projectName={projectData?.description} />
        </div>
      </ProjectProvider>
    </>
  );
}

function LoadingScreen({ stage }) {
  return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingContent}>
        <div className={styles.batteryContainer}>
          <div className={styles.batteryBody}>
            <div className={styles.batteryLevel}></div>
          </div>
          <div className={styles.batteryBump}></div>
        </div>
        <p className={`${styles.loadingText} blink`}>BUILDING YOUR PROJECT...</p>
        <p className={styles.loadingStage}>{stage}</p>
      </div>
    </div>
  );
}

function ErrorScreen({ error, onRetry }) {
  return (
    <div className={styles.errorScreen}>
      <div className="nes-container is-dark is-rounded">
        <div className={styles.errorContent}>
          <i className="nes-icon is-large close"></i>
          <h2 className={styles.errorTitle}>BUILD FAILED</h2>
          <p className={styles.errorMessage}>{error}</p>
          <button className="nes-btn is-primary" onClick={onRetry}>
            TRY AGAIN
          </button>
        </div>
      </div>
    </div>
  );
}
