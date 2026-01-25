'use client';

import { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { 
  generateProject, 
  generateAssemblyImages,
  generateSingleStepImage,
  buildReferenceImages,
  extractModuleNames 
} from '@/lib/api';
import { ProjectProvider, useProject } from '@/app/context/ProjectContext';
import GameDashboard from '@/app/components/GameDashboard';
import PixelBackground from '@/app/components/PixelBackground';
import styles from './page.module.css';
import mainStyles from '../../page.module.css';

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
    
    // Always call API, never use cached data
    // Clean up ALL possible cached data keys on mount
    if (typeof window !== 'undefined') {
      // Remove any cached data for this project ID
      localStorage.removeItem(`projectData_${id}`);
      // Also clean up any other potential cache keys
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('projectData_')) {
          localStorage.removeItem(key);
        }
      });
    }
    
    async function loadProject() {
      // Get description from localStorage (saved by landing page)
      const savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
      const project = savedProjects.find(p => p.id === id);
      const description = project?.name || id.replace(/-/g, ' ');

      try {
        let data;
        // 1. Call /generate to get parts, assembly steps, and final build image
        setLoadingStage('Generating parts list...');
        data = await generateProject(description);
        
        // 2. Set project data immediately with empty stepImages array
        // This allows the UI to render while images load in the background
        const initialProjectData = {
          description,
          parts: data,
          assemblySteps: data.assembly_steps || [],
          assembledProductImage: data.assembled_product_image?.imageUrl,
          firmware: data.firmware || null, // Include firmware code if generated
          stepImages: [] // Start with empty array, will be populated in background
        };
        
        setProjectData(initialProjectData);
        setLoading(false); // Show UI immediately after main data loads
        
        // 3. Load assembly images in the background (non-blocking)
        // Build reference images (download + base64 encode via proxy)
        let referenceImages = [];
        try {
          referenceImages = await buildReferenceImages(data);
        } catch (imgErr) {
          console.warn('Could not build reference images:', imgErr.message);
          // Continue without reference images
        }
        
        // 4. Build steps payload
        const steps = (data.assembly_steps || []).map((s, i) => ({
          id: i + 1,
          human_description: s
        }));
        
        // 5. Generate assembly images one by one (in background, progressive loading)
        if (steps.length > 0) {
          // Generate images sequentially, updating UI as each completes
          let previousImageB64 = null;
          const generatedImages = [];
          
          for (let i = 0; i < steps.length; i++) {
            try {
              const step = steps[i];
              const stepImageResponse = await generateSingleStepImage({
                project_id: id,
                title: description,
                scene: { modules: extractModuleNames(data) },
                reference_images: referenceImages,
                step: {
                  id: step.id,
                  human_description: step.human_description
                },
                previous_image_b64: previousImageB64
              });
              
              // Add to generated images
              generatedImages.push(stepImageResponse);
              
              // Update projectData immediately with this new image
              setProjectData(prev => ({
                ...prev,
                stepImages: [...generatedImages]
              }));
              
              // Update previous image for next iteration
              previousImageB64 = stepImageResponse.image_b64;
              
            } catch (stepErr) {
              console.warn(`Could not generate image for step ${i + 1}:`, stepErr.message);
              // Continue with next step even if one fails
            }
          }
        }
      } catch (err) {
        console.error('Project loading error:', err);
        setError(err.message);
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
        <ProjectDataUpdater projectData={projectData} />
        <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <GameDashboard projectName={projectData?.description} />
        </div>
      </ProjectProvider>
    </>
  );
}

// Component to sync projectData updates to context (for progressive image loading)
function ProjectDataUpdater({ projectData }) {
  const { setProjectData } = useProject();
  
  useEffect(() => {
    if (projectData) {
      // Always update context when projectData changes
      // This ensures progressive image loading works
      setProjectData(projectData);
    }
  }, [projectData?.stepImages?.length, projectData?.description, setProjectData]);
  
  return null;
}

function LoadingScreen({ stage }) {
  return (
    <div className={mainStyles.loadingScreen} suppressHydrationWarning>
      <div className={mainStyles.batteryContainer}>
        <div className={mainStyles.batteryBody}>
          <div className={mainStyles.batteryLevel}></div>
        </div>
        <div className={mainStyles.batteryBump}></div>
      </div>
      <p className={mainStyles.loadingText}>BUILDING...</p>
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
