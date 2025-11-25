export interface SubmissionFormState {
  // Admissibilité (Phase 1)
  residenceStatus: 'citizen' | 'permanent' | 'foreign' | '';
  mediumCategory: string;
  mediumDetail: string; // Précision si "Autre"
  complianceChecked: boolean;
  originalityChecked: boolean;

  // Identité
  artistName: string;
  artworkTitle: string;
  
  // Coordonnées
  email: string;
  emailCC: string; // Ajout du courriel secondaire
  phone: string;
  address: string;
  residenceProof1: File | null;
  residenceProof2: File | null;

  // Détails
  mediumDimensions: string;
  aiUsed: boolean; // Utilisation IA
  aiDetail: string; // Détails IA
  workHours: number | '';
  materialCost: number | '';
  dryingHours: number | '';
  travelHours: number | '';
  artisticStatement: string;
  artistCV: File | null; // Ajout du CV
  image: File | null;
  finalPrice: number | '';
}

export enum SubmissionStatus {
  IDLE = 'IDLE',
  PREVIEW = 'PREVIEW',
  SUBMITTING = 'SUBMITTING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface WebhookResponse {
  success: boolean;
  message?: string;
  galleryImageUrl?: string;
  [key: string]: any;
}

export interface AmortizationYear {
  year: number;
  rate: number;
  deduction: number;
  ucc: number; // Undepreciated Capital Cost (Solde)
}