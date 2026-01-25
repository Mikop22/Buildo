'use client';

import { createContext, useContext, useState } from 'react';

/**
 * Project Context for sharing project data across dashboard components
 * 
 * Data shape:
 * {
 *   description: "A CO2 sensor for my room",
 *   parts: { Microcontrollers: {...}, Sensors: {...}, ... },
 *   assemblySteps: ["Step 1: ...", "Step 2: ..."],
 *   assembledProductImage: "data:image/png;base64,...",
 *   stepImages: [
 *     { step: 1, image_b64: "..." },
 *     { step: 2, image_b64: "..." }
 *   ]
 * }
 */

const ProjectContext = createContext(null);

export function ProjectProvider({ children, initialData }) {
  const [projectData, setProjectData] = useState(initialData);

  return (
    <ProjectContext.Provider value={{ projectData, setProjectData }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === null) {
    // Return a default object to prevent errors when context isn't available
    return { projectData: null, setProjectData: () => {} };
  }
  return context;
}
