import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
import { Upload, ArrowRight, ArrowLeft, Loader2, Check, AlertCircle, Calculator, Image as ImageIcon, FileText, Send, DollarSign, Award, RefreshCw, CreditCard, ShieldCheck, Download, FileCheck, Info, Bot, AlertTriangle } from 'lucide-react';
import { Input } from './ui/Input';
import { TextArea } from './ui/TextArea';
import { Logo } from './ui/Logo';
import { submitArtwork } from '../services/api';
import { SubmissionFormState, SubmissionStatus, AmortizationYear } from '../types';

declare var html2canvas: any;

// --- TRANSLATION DICTIONARY ---
const TRANSLATIONS = {
  fr: {
    steps: {
      welcome: { title: 'Préparation', desc: "Documents requis avant de débuter." },
      eligibility: { title: 'Admissibilité', desc: "Vérification des critères Phase 1." },
      intro: { title: 'Identité', desc: "Identification du créateur." },
      contact: { title: 'Coordonnées', desc: "Informations légales & contact." },
      medium: { title: 'Matérialité', desc: "Spécifications techniques de l'œuvre." },
      metrics: { title: 'Mesures', desc: "Temps et coûts de production." },
      valuation: { title: 'Valorisation', desc: "Estimation de la valeur marchande." },
      statement: { title: 'Démarche', desc: "Contexte, CV et intention artistique." },
      visual: { title: 'Visuel', desc: "Capture visuelle de l'œuvre." }
    },
    welcome: {
      title: "Liste de vérification",
      items: [
        "Deux (2) pièces d'identité valides (Passeport, Permis, etc.).",
        "Photo haute résolution de l'œuvre (JPG/PNG).",
        "Détails techniques (Dimensions, Coûts matériaux, Heures).",
        "Votre Curriculum Vitae (CV) artistique à jour."
      ],
      note: "Ce processus prend environ 5 à 10 minutes. Vos données sont traitées de manière confidentielle et utilisées uniquement pour l'évaluation et l'ouverture de votre dossier au Salon des Inconnus."
    },
    labels: {
      residenceStatus: "Statut de Résidence",
      mediumCategory: "Catégorie d'Actif (Médium)",
      mediumDetail: "Précisez la technique",
      artistName: "Nom de l'artiste",
      artworkTitle: "Titre de l'œuvre",
      email: "Courriel (Principal)",
      emailCC: "Courriel (Secondaire / Agent)",
      phone: "Téléphone",
      address: "Adresse complète",
      residenceProof: "Preuves de résidence (2 documents)",
      mediumDimensions: "Médium & Dimensions",
      aiUsed: "De l'IA a-t-elle été utilisée dans le processus créatif ?",
      aiDetail: "Détails utilisation IA",
      workHours: "Heures de Travail",
      materialCost: "Coût Matériaux ($ CAD)",
      dryingHours: "Heures de Séchage",
      travelHours: "Heures de Déplacement",
      suggestedValue: "Valeur Suggérée",
      finalPrice: "Prix de vente final ($ CAD)",
      artisticStatement: "Manifeste Artistique",
      cv: "Curriculum Vitae (CV)",
      uploadCV: "Téléverser le CV",
      uploadImage: "Glissez ou cliquez pour ajouter",
      changeImage: "Changer l'image"
    },
    placeholders: {
      mediumDetail: "Ex. Gravure sur verre, Installation...",
      name: "Ex. Jean Michel",
      title: "Ex. Sans Titre N°4",
      email: "artiste@courriel.com",
      phone: "514-000-0000",
      address: "123 Rue Principale, Montréal, QC...",
      mediumDimensions: "Ex. Huile sur lin, 120x80cm",
      aiDetail: "Ex: utilisation de chat gpt pour structurer mes pensées, ou utilisation de midjourney pour generer des textures (5%) ou Génération avec collage (70%)...",
      statement: "Décrivez votre intention artistique, vos influences et le contexte de création...",
      number: "0"
    },
    options: {
      selectStatus: "Sélectionner votre statut...",
      citizen: "Citoyen Canadien (Éligible DPA)",
      permanent: "Résident Permanent (Éligible DPA)",
      foreign: "Étranger (Non éligible DPA)",
      selectMedium: "Sélectionner le médium...",
      painting: "Peinture",
      sculpture: "Sculpture",
      photography: "Photographie",
      digital: "Arts Numériques",
      mixed: "Techniques Mixtes",
      other: "Autre technique"
    },
    compliance: {
      title: "Déclaration de Conformité ARC",
      desc: "Je déclare que l'œuvre et l'artiste répondent aux exigences suivantes pour la déduction fiscale (Catégorie 8) :",
      list: [
        "L'artiste était citoyen canadien ou résident permanent à la création de l'œuvre.",
        "L'œuvre est une création originale (excluant les reproductions à grand tirage).",
        "Le coût d'acquisition est supérieur à 200 $ CAD.",
        "L'œuvre est acquise dans le but d'être exposée dans un lieu d'affaires."
      ],
      originality: "Je déclare l'originalité de l'œuvre."
    },
    aiDisclaimer: "Attention : Certaines œuvres qui utilisent trop l'IA ne sont pas éligibles.",
    aiNote: "La précision technique et la transparence sur les outils utilisés augmentent la valeur perçue et la confiance de l'acquéreur.",
    buttons: {
      back: "Précédent",
      next: "Continuer",
      generate: "Générer la Fiche",
      apply: "Appliquer",
      edit: "Modifier",
      confirm: "Confirmer et Envoyer",
      download: "Télécharger",
      print: "Imprimer",
      new: "Nouveau dossier",
      capturing: "Capture en cours..."
    },
    errors: {
      required: "Requis",
      selection: "Sélection requise.",
      email: "Courriel valide requis.",
      fileSize: "Le fichier ne doit pas dépasser 10 MB.",
      aiDetail: "Veuillez préciser l'usage de l'IA.",
      compliance: "La déclaration est requise.",
      price: "Un prix de vente est requis.",
      image: "Veuillez télécharger une image."
    },
    preview: {
      title: "Fiche d'artiste & Appréciation",
      ref: "REF",
      acquisitionValue: "Valeur d'acquisition",
      financingTitle: "Autres options d'acquisition (financement)",
      monthly: "Mensualité",
      financingNote: "Montant estimé à titre indicatif seulement, le montant final doit être évalué par notre expert financier.",
      dpaTitle: "Déduction Fiscale (DPA)",
      year: "Année",
      deduction: "Déduction",
      statementTitle: "Démarche & Intention",
      signature: "Signature Autorisée",
      successTitle: "Dossier transmis",
      successMsg: "Une copie a été envoyée à",
      previewTitle: "Prévisualisation",
      previewMsg: "Vérifiez l'exactitude avant l'envoi officiel.",
      loading: "Finalisation du dossier...",
      error: "Échec de l'envoi"
    }
  },
  en: {
    steps: {
      welcome: { title: 'Preparation', desc: "Required documents before starting." },
      eligibility: { title: 'Eligibility', desc: "Phase 1 criteria check." },
      intro: { title: 'Identity', desc: "Creator identification." },
      contact: { title: 'Contact', desc: "Legal info & contact details." },
      medium: { title: 'Materiality', desc: "Technical specifications." },
      metrics: { title: 'Metrics', desc: "Production time and costs." },
      valuation: { title: 'Valuation', desc: "Market value estimation." },
      statement: { title: 'Statement', desc: "Context, CV and artistic intent." },
      visual: { title: 'Visual', desc: "Visual capture of the artwork." }
    },
    welcome: {
      title: "Checklist",
      items: [
        "Two (2) valid IDs (Passport, License, etc.).",
        "High-resolution photo of the artwork (JPG/PNG).",
        "Technical details (Dimensions, Material costs, Hours).",
        "Your current Artistic Curriculum Vitae (CV)."
      ],
      note: "This process takes about 5 to 10 minutes. Your data is treated confidentially and used solely for the evaluation and opening of your file at the Salon des Inconnus."
    },
    labels: {
      residenceStatus: "Residence Status",
      mediumCategory: "Asset Category (Medium)",
      mediumDetail: "Specify technique",
      artistName: "Artist Name",
      artworkTitle: "Artwork Title",
      email: "Email (Primary)",
      emailCC: "Email (Secondary / Agent)",
      phone: "Phone",
      address: "Full Address",
      residenceProof: "Proof of Residence (2 documents)",
      mediumDimensions: "Medium & Dimensions",
      aiUsed: "Was AI used in the creative process?",
      aiDetail: "AI Usage Details",
      workHours: "Labor Hours",
      materialCost: "Material Cost ($ CAD)",
      dryingHours: "Drying Hours",
      travelHours: "Travel Hours",
      suggestedValue: "Suggested Value",
      finalPrice: "Final Sale Price ($ CAD)",
      artisticStatement: "Artistic Statement",
      cv: "Curriculum Vitae (CV)",
      uploadCV: "Upload CV",
      uploadImage: "Drag or click to add",
      changeImage: "Change Image"
    },
    placeholders: {
      mediumDetail: "Ex. Glass etching, Installation...",
      name: "Ex. Jean Michel",
      title: "Ex. Untitled No. 4",
      email: "artist@email.com",
      phone: "514-000-0000",
      address: "123 Main Street, Montreal, QC...",
      mediumDimensions: "Ex. Oil on linen, 120x80cm",
      aiDetail: "Ex: Using ChatGPT to structure thoughts, or Midjourney to generate textures (5%), or Generation with collage (70%)...",
      statement: "Describe your artistic intent, influences, and creation context...",
      number: "0"
    },
    options: {
      selectStatus: "Select your status...",
      citizen: "Canadian Citizen (CCA Eligible)",
      permanent: "Permanent Resident (CCA Eligible)",
      foreign: "Foreigner (Not CCA Eligible)",
      selectMedium: "Select medium...",
      painting: "Painting",
      sculpture: "Sculpture",
      photography: "Photography",
      digital: "Digital Arts",
      mixed: "Mixed Media",
      other: "Other technique"
    },
    compliance: {
      title: "CRA Compliance Declaration",
      desc: "I declare that the artwork and artist meet the following requirements for tax deduction (Class 8):",
      list: [
        "The artist was a Canadian citizen or permanent resident at the time of creation.",
        "The artwork is an original creation (excluding large-scale reproductions).",
        "The acquisition cost is greater than $200 CAD.",
        "The artwork is acquired for the purpose of being exhibited in a place of business."
      ],
      originality: "I declare the originality of the artwork."
    },
    aiDisclaimer: "Warning: Artworks that rely too heavily on AI may not be eligible.",
    aiNote: "Technical precision and transparency regarding tools used increase perceived value and buyer confidence.",
    buttons: {
      back: "Back",
      next: "Continue",
      generate: "Generate Sheet",
      apply: "Apply",
      edit: "Edit",
      confirm: "Confirm and Send",
      download: "Download",
      print: "Print",
      new: "New File",
      capturing: "Capturing..."
    },
    errors: {
      required: "Required",
      selection: "Selection required.",
      email: "Valid email required.",
      fileSize: "File must not exceed 10 MB.",
      aiDetail: "Please specify AI usage details.",
      compliance: "Declaration is required.",
      price: "Sale price is required.",
      image: "Please upload an image."
    },
    preview: {
      title: "Artist Sheet & Appraisal",
      ref: "REF",
      acquisitionValue: "Acquisition Value",
      financingTitle: "Other Acquisition Options (Financing)",
      monthly: "Monthly",
      financingNote: "Estimated amount for indicative purposes only, the final amount must be evaluated by our financial expert.",
      dpaTitle: "Tax Deduction (CCA)",
      year: "Year",
      deduction: "Deduction",
      statementTitle: "Statement & Intent",
      signature: "Authorized Signature",
      successTitle: "File Transmitted",
      successMsg: "A copy has been sent to",
      previewTitle: "Preview",
      previewMsg: "Verify accuracy before official submission.",
      loading: "Finalizing file...",
      error: "Submission Failed"
    }
  }
};

interface ArtSubmissionFormProps {
  lang: 'fr' | 'en';
}

export const ArtSubmissionForm: React.FC<ArtSubmissionFormProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang]; // Shortcut for current language

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<SubmissionFormState>({
    residenceStatus: '',
    mediumCategory: '',
    mediumDetail: '',
    complianceChecked: false,
    originalityChecked: false,
    artistName: '',
    artworkTitle: '',
    email: '',
    emailCC: '',
    phone: '',
    address: '',
    residenceProof1: null,
    residenceProof2: null,
    mediumDimensions: '',
    aiUsed: false,
    aiDetail: '',
    workHours: '',
    materialCost: '',
    dryingHours: '',
    travelHours: '',
    artisticStatement: '',
    artistCV: null,
    image: null,
    finalPrice: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SubmissionFormState, string>>>({});
  const [status, setStatus] = useState<SubmissionStatus>(SubmissionStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const residenceInputRef1 = useRef<HTMLInputElement>(null);
  const residenceInputRef2 = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Remonter en haut à chaque changement d'étape
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentStep, status]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (errors[name as keyof SubmissionFormState]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };

  const handleCheckboxChange = (name: keyof SubmissionFormState, checked: boolean) => {
    if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, fieldName: 'image' | 'residenceProof1' | 'residenceProof2' | 'artistCV') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, [fieldName]: t.errors.fileSize }));
        return;
      }
      setFormData(prev => ({ ...prev, [fieldName]: file }));
      setErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };

  const calculateRecommendedPrice = (): number => {
    const hours = typeof formData.workHours === 'number' ? formData.workHours : 0;
    const material = typeof formData.materialCost === 'number' ? formData.materialCost : 0;
    const drying = typeof formData.dryingHours === 'number' ? formData.dryingHours : 0;
    const travel = typeof formData.travelHours === 'number' ? formData.travelHours : 0;

    const laborCost = (Math.min(hours, 10) * 50) + (Math.max(hours - 10, 0) * 35);
    const materialTotal = material * 2;
    const dryingCost = drying * 5;
    const travelCost = travel * 15;

    return laborCost + materialTotal + dryingCost + travelCost;
  };

  // Calcul Mensualité Crédit-Bail
  const calculateMonthlyPayment = (price: number, months: number) => {
    if (price <= 0) return 0;
    const annualRate = 0.12; 
    const monthlyRate = annualRate / 12;
    return (price * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  };

  // Calcul DPA COMPLET
  const calculateFullSchedule = (price: number): AmortizationYear[] => {
      const schedule: AmortizationYear[] = [];
      let ucc = price;
      let year = 1;
      
      while (ucc > 5 && year <= 10) {
          let rate = 0.20; 
          if (year === 1) rate = 0.10; 

          const deduction = ucc * rate;
          const closingUcc = ucc - deduction;

          schedule.push({
              year,
              rate,
              deduction,
              ucc: closingUcc
          });

          ucc = closingUcc;
          year++;
      }
      return schedule;
  };

  const applyRecommendedPrice = () => {
    const price = calculateRecommendedPrice();
    setFormData(prev => ({ ...prev, finalPrice: price }));
    setErrors(prev => ({ ...prev, finalPrice: undefined }));
  };

  const validateStep = (stepIndex: number): boolean => {
    const newErrors: Partial<Record<keyof SubmissionFormState, string>> = {};
    let isValid = true;

    if (stepIndex === 1) { // Admissibilité
        if (!formData.residenceStatus) { newErrors.residenceStatus = t.errors.selection; isValid = false; }
        if (!formData.mediumCategory) { newErrors.mediumCategory = t.errors.selection; isValid = false; }
        if (formData.mediumCategory === 'Autre' && !formData.mediumDetail.trim()) {
           newErrors.mediumDetail = t.errors.required; isValid = false; 
        }
        if (!formData.complianceChecked) { newErrors.complianceChecked = t.errors.compliance; isValid = false; }
        if (!formData.originalityChecked) { newErrors.originalityChecked = t.errors.compliance; isValid = false; }
    }

    if (stepIndex === 2) { // Identité
      if (!formData.artistName.trim()) { newErrors.artistName = t.errors.required; isValid = false; }
      if (!formData.artworkTitle.trim()) { newErrors.artworkTitle = t.errors.required; isValid = false; }
    }

    if (stepIndex === 3) { // Contact
        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) { newErrors.email = t.errors.email; isValid = false; }
        if (formData.emailCC && !/\S+@\S+\.\S+/.test(formData.emailCC)) { newErrors.emailCC = t.errors.email; isValid = false; }
        if (!formData.phone.trim()) { newErrors.phone = t.errors.required; isValid = false; }
        if (!formData.address.trim()) { newErrors.address = t.errors.required; isValid = false; }
        if (!formData.residenceProof1) { newErrors.residenceProof1 = t.errors.required; isValid = false; }
        if (!formData.residenceProof2) { newErrors.residenceProof2 = t.errors.required; isValid = false; }
    }

    if (stepIndex === 4) { // Materialité
       if (!formData.mediumDimensions.trim()) { newErrors.mediumDimensions = t.errors.required; isValid = false; }
       if (formData.aiUsed && !formData.aiDetail.trim()) {
           newErrors.aiDetail = t.errors.aiDetail; isValid = false;
       }
    }

    if (stepIndex === 5) { // Metriques
      if (formData.workHours === '') { newErrors.workHours = t.errors.required; isValid = false; }
      if (formData.materialCost === '') { newErrors.materialCost = t.errors.required; isValid = false; }
      if (formData.dryingHours === '') { newErrors.dryingHours = t.errors.required; isValid = false; }
      if (formData.travelHours === '') { newErrors.travelHours = t.errors.required; isValid = false; }
    }

    if (stepIndex === 6) { // Valuation
        if (formData.finalPrice === '' || (typeof formData.finalPrice === 'number' && formData.finalPrice < 0)) {
            newErrors.finalPrice = t.errors.price;
            isValid = false;
        }
    }

    if (stepIndex === 7) { // Statement
       if (!formData.artisticStatement.trim()) {
         newErrors.artisticStatement = t.errors.required;
         isValid = false;
       }
       if (!formData.artistCV) {
           newErrors.artistCV = t.errors.required;
           isValid = false;
       }
    }

    if (stepIndex === 8) { // Visual
      if (!formData.image) {
        newErrors.image = t.errors.image;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 8) { // Updated for dynamic steps check
        setCurrentStep(prev => prev + 1);
      } else {
        setStatus(SubmissionStatus.PREVIEW);
      }
    }
  };

  const handleBack = () => {
    if (status === SubmissionStatus.PREVIEW) {
        setStatus(SubmissionStatus.IDLE);
        return;
    }
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleDownload = async () => {
      if (!sheetRef.current) return;
      try {
          const canvas = await html2canvas(sheetRef.current, {
              scale: 2,
              useCORS: true,
              backgroundColor: '#ffffff'
          });
          const link = document.createElement('a');
          link.download = `Fiche_${formData.artistName.replace(/\s+/g, '_')}_${formData.artworkTitle.replace(/\s+/g, '_')}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
      } catch (e) {
          console.error("Download failed", e);
      }
  };

  const handleFinalSubmit = async () => {
    if (isCapturing || status === SubmissionStatus.SUBMITTING) return;
    
    setIsCapturing(true);
    let finalSheetImageBase64 = undefined;

    // 1. CAPTURE DE LA FICHE PENDANT QU'ELLE EST ENCORE AFFICHÉE
    if (sheetRef.current) {
        try {
            console.log("📸 Capture de la fiche en cours...");
            // Petite pause pour s'assurer que le rendu est stable
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const canvas = await html2canvas(sheetRef.current, {
                scale: 2, 
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            finalSheetImageBase64 = canvas.toDataURL('image/png');
            console.log("✅ Capture réussie");
        } catch (e) {
            console.error("Erreur capture image:", e);
        }
    }

    // 2. CHANGEMENT D'ÉTAT APRÈS LA CAPTURE
    setIsCapturing(false);
    setStatus(SubmissionStatus.SUBMITTING);
    setErrorMessage('');
    
    // 3. ENVOI DES DONNÉES
    try {
      const response = await submitArtwork(formData, finalSheetImageBase64);
      if(response.galleryImageUrl) {
          setGeneratedImage(response.galleryImageUrl);
      }
      setStatus(SubmissionStatus.SUCCESS);
    } catch (error: any) {
      setStatus(SubmissionStatus.ERROR);
      setErrorMessage(error.message || "Une erreur inconnue est survenue.");
    }
  };

  // Define steps array dynamically based on lang
  const stepsList = [
      { id: 'welcome', ...t.steps.welcome },
      { id: 'eligibility', ...t.steps.eligibility },
      { id: 'intro', ...t.steps.intro },
      { id: 'contact', ...t.steps.contact },
      { id: 'medium', ...t.steps.medium },
      { id: 'metrics', ...t.steps.metrics },
      { id: 'valuation', ...t.steps.valuation },
      { id: 'statement', ...t.steps.statement },
      { id: 'visual', ...t.steps.visual }
  ];

  // --- COMPOSANT FICHE (Réutilisé pour PREVIEW et SUCCESS) ---
  const FicheArtiste = () => {
      const price = typeof formData.finalPrice === 'number' ? formData.finalPrice : 0;
      const monthly48 = calculateMonthlyPayment(price, 48);
      const monthly96 = calculateMonthlyPayment(price, 96);
      const schedule = calculateFullSchedule(price);
      
      const displayedMedium = formData.mediumCategory === 'Autre' ? formData.mediumDetail : formData.mediumCategory;

      return (
        <div id="printable-sheet" ref={sheetRef} className="bg-white text-black shadow-2xl w-full relative flex flex-col h-auto min-h-[800px] mx-auto max-w-[1200px] print:max-w-none print:shadow-none print:w-full print:absolute print:top-0 print:left-0">
            {/* EN-TÊTE */}
            <div className="px-10 py-10 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center space-x-6">
                    <div className="h-20 w-auto flex items-center justify-center text-black">
                         <Logo className="h-full w-auto" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-black tracking-tighter uppercase leading-none">Salon des Inconnus</h1>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] mt-2">{t.preview.title}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-black">{new Date().toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-xs text-gray-400 font-mono mt-1">{t.preview.ref}: {Math.floor(Math.random() * 100000).toString().padStart(6, '0')}</p>
                </div>
            </div>

            {/* CONTENU PRINCIPAL */}
            <div className="flex-grow flex flex-col md:flex-row h-auto">
                
                {/* COLONNE GAUCHE (INFO & CHIFFRES) */}
                <div className="w-full md:w-[35%] lg:w-[30%] bg-white p-8 lg:p-10 border-r border-gray-100 flex flex-col shrink-0 h-auto">
                    
                    {/* Artiste */}
                    <div className="mb-10">
                        <h3 className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">{t.labels.artistName}</h3>
                        <p className="text-3xl font-serif italic text-black leading-none mb-3 break-words">{formData.artistName}</p>
                        <p className="text-lg font-medium text-gray-800 leading-tight break-words border-l-2 border-black pl-3">"{formData.artworkTitle}"</p>
                        <div className="flex flex-wrap items-center mt-4 gap-2">
                            <span className="bg-gray-100 px-2 py-1 rounded text-[10px] uppercase font-bold text-gray-600 tracking-wide">{displayedMedium}</span>
                            <span className="text-xs text-gray-500 font-mono">{formData.mediumDimensions}</span>
                        </div>
                    </div>

                    {/* Prix */}
                    <div className="mb-8 pb-8 border-b border-gray-100">
                        <h3 className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">{t.preview.acquisitionValue}</h3>
                        <div className="text-4xl font-bold text-black tracking-tight">{price.toLocaleString(lang === 'fr' ? 'fr-CA' : 'en-CA', { minimumFractionDigits: 2 })} $ <span className="text-sm font-normal text-gray-400 align-top mt-2 inline-block">CAD</span></div>
                    </div>

                    {/* FINANCEMENT */}
                    <div className="mb-8">
                         <div className="flex items-center space-x-2 mb-3">
                            <CreditCard className="w-4 h-4 text-black" />
                            <h3 className="text-[10px] font-bold uppercase text-gray-900 tracking-wider">{t.preview.financingTitle}</h3>
                         </div>
                         <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500 font-medium">{t.preview.monthly} (48 mois)</span>
                                <span className="text-sm font-bold text-black">{monthly48.toFixed(2)} $</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-gray-200 pt-2">
                                <span className="text-xs text-gray-500 font-medium">{t.preview.monthly} (96 mois)</span>
                                <span className="text-sm font-bold text-black">{monthly96.toFixed(2)} $</span>
                            </div>
                            <p className="text-[9px] text-gray-500 mt-2 leading-tight italic border-t border-gray-200 pt-2">
                                {t.preview.financingNote}
                            </p>
                         </div>
                    </div>
                             
                    {/* DPA TABLE */}
                    {(formData.residenceStatus === 'citizen' || formData.residenceStatus === 'permanent') && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <Award className="w-4 h-4 text-black" />
                                <span className="text-[10px] font-bold uppercase text-black">{t.preview.dpaTitle}</span>
                            </div>
                            <span className="text-[9px] font-bold text-white bg-black px-2 py-0.5 rounded-full">Cat. 8</span>
                        </div>
                        
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-100 text-gray-600 font-semibold uppercase text-[9px]">
                                    <tr>
                                        <th className="px-3 py-1.5">{t.preview.year}</th>
                                        <th className="px-3 py-1.5 text-right">{t.preview.deduction}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {schedule.slice(0, 5).map((row) => (
                                        <tr key={row.year}>
                                            <td className="px-3 py-1.5 text-gray-600 font-mono">AN {row.year}</td>
                                            <td className="px-3 py-1.5 text-right font-bold text-black">{row.deduction.toFixed(0)} $</td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td className="px-3 py-1.5 text-gray-400 italic text-[10px]">...</td>
                                        <td className="px-3 py-1.5 text-right text-gray-400 text-[10px]">100%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    )}
                </div>

                {/* COLONNE DROITE (VISUEL & TEXTE) */}
                <div className="w-full md:w-[65%] lg:w-[70%] bg-[#F5F5F7] relative flex flex-col h-auto">
                    
                    {/* Image Container */}
                    <div className="w-full p-12 flex items-center justify-center bg-[#F5F5F7] min-h-[400px]">
                         {(generatedImage || formData.image) && (
                            <img 
                                src={generatedImage || (formData.image ? URL.createObjectURL(formData.image) : '')} 
                                className="w-auto max-w-full max-h-[600px] object-contain shadow-2xl rounded-sm"
                                alt="Visuel final"
                            />
                        )}
                    </div>
                    
                    {/* Manifeste Section */}
                    <div className="bg-white p-10 md:p-12 border-t border-gray-100 flex-grow">
                         <h3 className="text-[10px] font-bold uppercase text-gray-400 mb-4 tracking-[0.2em] flex items-center">
                            <FileText className="w-3 h-3 mr-2" />
                            {t.preview.statementTitle}
                         </h3>
                         <div className="text-sm md:text-base leading-relaxed font-serif text-gray-800 columns-1 md:columns-2 gap-10 text-justify">
                             {formData.artisticStatement}
                         </div>
                         
                         {/* Signature */}
                         <div className="mt-16 pt-8 border-t border-gray-100 w-full flex justify-end">
                            <div className="text-right">
                                <div className="h-10 w-48 border-b border-gray-300 mb-2"></div>
                                <span className="text-[9px] text-gray-400 uppercase tracking-widest block">{t.preview.signature}</span>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
      );
  };


  // --- ETAT : PREVIEW ou SUCCÈS ou ENVOI ---
  if (status === SubmissionStatus.PREVIEW || status === SubmissionStatus.SUCCESS || status === SubmissionStatus.SUBMITTING) {
      return (
        <div className="flex flex-col items-center animate-fade-in w-full max-w-[1920px] mx-auto text-brand-black" ref={topRef}>
            
            {/* Banner Control */}
            <div className="w-full max-w-[1200px] bg-black/60 border border-white/10 px-8 py-6 rounded-2xl mb-10 flex flex-col md:flex-row items-center justify-between print:hidden shadow-[0_0_50px_rgba(255,255,255,0.05)] backdrop-blur-xl relative overflow-hidden group">
                 {/* Subtle Sheen */}
                 <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                 
                 <div className="flex items-center space-x-6 relative z-10">
                    {status === SubmissionStatus.SUCCESS ? (
                         <>
                            <div className="p-3 bg-green-500/10 rounded-full border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                                <Check className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <span className="text-xl font-bold text-white block tracking-tight">{t.preview.successTitle}</span>
                                <span className="text-sm text-gray-400">{t.preview.successMsg} {formData.email}.</span>
                            </div>
                         </>
                    ) : (
                         <>
                             <div className="p-3 bg-white/10 rounded-full border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                                <ImageIcon className="w-6 h-6 text-gray-200" />
                            </div>
                            <div>
                                <span className="text-xl font-bold text-white block tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{t.preview.previewTitle}</span>
                                <span className="text-sm text-gray-400">{t.preview.previewMsg}</span>
                            </div>
                         </>
                    )}
                 </div>

                 <div className="flex space-x-4 mt-6 md:mt-0 relative z-10">
                     {status === SubmissionStatus.PREVIEW && (
                        <>
                            <button 
                                onClick={handleBack}
                                disabled={isCapturing}
                                className="flex items-center space-x-2 px-6 py-3 bg-[#1c1c1e] text-white border border-white/10 rounded-xl hover:bg-[#2c2c2e] hover:border-white/30 transition-all text-sm font-semibold backdrop-blur-md btn-shine disabled:opacity-50"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>{t.buttons.edit}</span>
                            </button>
                             <button 
                                onClick={handleFinalSubmit}
                                disabled={isCapturing}
                                className="flex items-center space-x-2 px-8 py-3 bg-white text-black rounded-xl hover:bg-gray-200 transition-all text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-wait"
                            >
                                {isCapturing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                <span>{isCapturing ? t.buttons.capturing : t.buttons.confirm}</span>
                            </button>
                        </>
                     )}
                     {status === SubmissionStatus.SUCCESS && (
                         <>
                            <button 
                                onClick={handleDownload}
                                className="flex items-center space-x-2 px-6 py-3 bg-[#1c1c1e] text-white border border-white/10 rounded-xl hover:bg-[#2c2c2e] transition text-sm font-medium"
                             >
                                <Download className="w-4 h-4" />
                                <span>{t.buttons.download}</span>
                            </button>
                            <button 
                                onClick={() => window.location.reload()}
                                className="flex items-center space-x-2 px-6 py-3 bg-white text-black rounded-xl hover:bg-gray-200 transition text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>{t.buttons.new}</span>
                            </button>
                         </>
                     )}
                 </div>
            </div>

            {/* RENDER SHEET */}
            {status === SubmissionStatus.SUBMITTING ? (
                <div className="min-h-[600px] flex flex-col items-center justify-center text-white space-y-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-10 animate-pulse"></div>
                        <Loader2 className="w-16 h-16 animate-spin text-gray-200 relative z-10" />
                    </div>
                    <p className="text-xl font-medium animate-pulse text-gray-300">{t.preview.loading}</p>
                </div>
            ) : (
                 <FicheArtiste />
            )}
        </div>
      );
  }

  // --- RENDU FORMULAIRE (METALLIC THEME) ---
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20 items-start text-white" ref={topRef}>
      
      {/* LEFT COLUMN: Context */}
      <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-10 animate-fade-in pl-2">
          
          <div className="hidden lg:block mb-8">
                <div className="h-24 w-auto mb-4 text-white opacity-90 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    <Logo className="h-full w-auto" />
                </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 block animate-pulse-slow">
                Protocole {currentStep + 1} / {stepsList.length}
            </span>
            <h2 className="text-4xl lg:text-5xl font-semibold text-white tracking-tighter mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-200 to-gray-500">
              {stepsList[currentStep].title}
            </h2>
            <p className="text-gray-400 text-lg font-light leading-relaxed">
              {stepsList[currentStep].desc}
            </p>
          </div>

          {/* Progress Indicators */}
          <div className="flex lg:flex-col space-x-1 lg:space-x-0 lg:space-y-4">
            {stepsList.map((step, idx) => (
              <div key={step.id} className="flex items-center group">
                   <div 
                    className={`h-1 lg:h-1 rounded-full transition-all duration-700 ease-out 
                        ${idx === currentStep 
                            ? 'w-10 lg:w-24 bg-gradient-to-r from-gray-400 via-white to-gray-400 shadow-[0_0_10px_rgba(255,255,255,0.3)]' 
                            : (idx < currentStep 
                                ? 'w-2 lg:w-12 bg-white opacity-40' 
                                : 'w-2 lg:w-4 bg-white/10')}
                    `} 
                   />
              </div>
            ))}
          </div>
      </div>

      {/* RIGHT COLUMN: Form Card */}
      <div className="lg:col-span-8">
        <div className="metallic-border p-8 md:p-12 min-h-[600px] animate-slide-in flex flex-col justify-between relative overflow-hidden">
            
            {/* Inner Sheen Effects */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-white/5 to-transparent rounded-full blur-[100px] pointer-events-none"></div>

            <div className="mb-10 relative z-10">
                
                {/* STEP 0: WELCOME */}
                {currentStep === 0 && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-md">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                                <Info className="w-5 h-5 mr-3 text-gray-300" />
                                {t.welcome.title}
                            </h3>
                            <ul className="space-y-4">
                                {t.welcome.items.map((item, i) => (
                                    <li key={i} className="flex items-start">
                                        <div className="p-1 bg-white/10 rounded mr-3 mt-1"><Check className="w-3 h-3 text-white" /></div>
                                        <span className="text-gray-300">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            {t.welcome.note}
                        </p>
                    </div>
                )}

                {/* STEP 1: ADMISSIBILITÉ */}
                {currentStep === 1 && (
                    <div className="space-y-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 ml-1 tracking-wide">{t.labels.residenceStatus}</label>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-white/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <select 
                                    name="residenceStatus"
                                    value={formData.residenceStatus}
                                    onChange={handleInputChange}
                                    className="relative w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:bg-white/10 focus:border-white/30 transition-all text-lg font-medium appearance-none cursor-pointer backdrop-blur-md"
                                >
                                    <option value="" className="bg-black text-gray-400">{t.options.selectStatus}</option>
                                    <option value="citizen" className="bg-black">{t.options.citizen}</option>
                                    <option value="permanent" className="bg-black">{t.options.permanent}</option>
                                    <option value="foreign" className="bg-black">{t.options.foreign}</option>
                                </select>
                            </div>
                            {errors.residenceStatus && <p className="mt-2 text-xs text-red-400 ml-1">{errors.residenceStatus}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 ml-1 tracking-wide">{t.labels.mediumCategory}</label>
                            <div className="relative group">
                                <select 
                                    name="mediumCategory"
                                    value={formData.mediumCategory}
                                    onChange={handleInputChange}
                                    className="relative w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:bg-white/10 focus:border-white/30 transition-all text-lg font-medium appearance-none cursor-pointer backdrop-blur-md"
                                >
                                    <option value="" className="bg-black text-gray-400">{t.options.selectMedium}</option>
                                    <option value="Peinture" className="bg-black">{t.options.painting}</option>
                                    <option value="Sculpture" className="bg-black">{t.options.sculpture}</option>
                                    <option value="Photographie" className="bg-black">{t.options.photography}</option>
                                    <option value="Arts Numériques" className="bg-black">{t.options.digital}</option>
                                    <option value="Techniques Mixtes" className="bg-black">{t.options.mixed}</option>
                                    <option value="Autre" className="bg-black">{t.options.other}</option>
                                </select>
                            </div>
                            {errors.mediumCategory && <p className="mt-2 text-xs text-red-400 ml-1">{errors.mediumCategory}</p>}
                        </div>

                        {formData.mediumCategory === 'Autre' && (
                            <div className="animate-fade-in">
                                <Input
                                    label={t.labels.mediumDetail}
                                    name="mediumDetail"
                                    placeholder={t.placeholders.mediumDetail}
                                    value={formData.mediumDetail}
                                    onChange={handleInputChange}
                                    error={errors.mediumDetail}
                                    autoFocus
                                />
                            </div>
                        )}

                        <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-colors backdrop-blur-md">
                            <label className="flex items-start cursor-pointer group">
                                <div className="relative flex items-center mt-1">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.complianceChecked}
                                        onChange={(e) => handleCheckboxChange('complianceChecked', e.target.checked)}
                                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-400 bg-transparent transition-all checked:border-white checked:bg-white flex-shrink-0"
                                    />
                                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100">
                                        <Check className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <strong className="text-white block mb-2 font-semibold">{t.compliance.title}</strong>
                                    <span className="text-sm text-gray-300 leading-relaxed block mb-3">
                                        {t.compliance.desc}
                                    </span>
                                    <ul className="list-disc pl-4 space-y-1 text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                                        {t.compliance.list.map((item, i) => (
                                            <li key={i} dangerouslySetInnerHTML={{__html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}}></li>
                                        ))}
                                    </ul>
                                </div>
                            </label>
                            {errors.complianceChecked && <p className="mt-2 text-xs text-red-400">{errors.complianceChecked}</p>}
                        </div>

                        <div>
                            <label className="flex items-center cursor-pointer p-5 border border-white/10 rounded-xl hover:bg-white/5 transition-colors group bg-white/5 backdrop-blur-sm">
                                <div className="relative flex items-center">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.originalityChecked}
                                        onChange={(e) => handleCheckboxChange('originalityChecked', e.target.checked)}
                                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-400 bg-transparent transition-all checked:border-white checked:bg-white"
                                    />
                                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100">
                                        <Check className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                                <span className="ml-4 text-base font-medium text-gray-200 group-hover:text-white transition-colors">
                                    {t.compliance.originality}
                                </span>
                            </label>
                            {errors.originalityChecked && <p className="mt-2 text-xs text-red-400 ml-1">{errors.originalityChecked}</p>}
                        </div>
                    </div>
                )}

                {/* STEP 2: Identité */}
                {currentStep === 2 && (
                <div className="space-y-8">
                    <Input
                    label={t.labels.artistName}
                    name="artistName"
                    placeholder={t.placeholders.name}
                    value={formData.artistName}
                    onChange={handleInputChange}
                    error={errors.artistName}
                    autoFocus
                    />
                    <Input
                    label={t.labels.artworkTitle}
                    name="artworkTitle"
                    placeholder={t.placeholders.title}
                    value={formData.artworkTitle}
                    onChange={handleInputChange}
                    error={errors.artworkTitle}
                    />
                </div>
                )}

                {/* STEP 3: Coordonnées & Preuves */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                            label={t.labels.email}
                            name="email"
                            type="email"
                            placeholder={t.placeholders.email}
                            value={formData.email}
                            onChange={handleInputChange}
                            error={errors.email}
                            autoFocus
                            />
                            <Input
                            label={t.labels.emailCC}
                            name="emailCC"
                            type="email"
                            placeholder="agent@email.com"
                            value={formData.emailCC}
                            onChange={handleInputChange}
                            error={errors.emailCC}
                            />
                        </div>
                         <Input
                            label={t.labels.phone}
                            name="phone"
                            type="tel"
                            placeholder={t.placeholders.phone}
                            value={formData.phone}
                            onChange={handleInputChange}
                            error={errors.phone}
                        />
                        <TextArea
                        label={t.labels.address}
                        name="address"
                        rows={3}
                        placeholder={t.placeholders.address}
                        value={formData.address}
                        onChange={handleInputChange}
                        error={errors.address}
                        />
                        
                        <div className="pt-6 border-t border-white/10">
                            <label className="block text-sm font-medium text-gray-300 mb-2 ml-1 tracking-wide">{t.labels.residenceProof}</label>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* DOC 1 */}
                                <div 
                                    className={`flex flex-col items-center justify-center p-6 border border-dashed rounded-xl cursor-pointer transition-all bg-white/5 backdrop-blur-sm ${errors.residenceProof1 ? 'border-red-500/50 bg-red-900/10' : 'border-white/20 hover:border-white/50 hover:bg-white/10'}`}
                                    onClick={() => residenceInputRef1.current?.click()}
                                >
                                    <input
                                        ref={residenceInputRef1}
                                        type="file"
                                        accept=".pdf,image/*"
                                        onChange={(e) => handleFileChange(e, 'residenceProof1')}
                                        className="hidden"
                                    />
                                    <div className="p-3 bg-white/10 rounded-full mb-2">
                                        {formData.residenceProof1 ? <Check className="w-5 h-5 text-green-400"/> : <ShieldCheck className="w-5 h-5 text-gray-400"/>}
                                    </div>
                                    <div className="text-center">
                                        {formData.residenceProof1 ? (
                                            <span className="font-medium text-xs text-white break-all">{formData.residenceProof1.name}</span>
                                        ) : (
                                            <span className="text-sm font-medium text-gray-300">Doc #1</span>
                                        )}
                                    </div>
                                </div>

                                {/* DOC 2 */}
                                <div 
                                    className={`flex flex-col items-center justify-center p-6 border border-dashed rounded-xl cursor-pointer transition-all bg-white/5 backdrop-blur-sm ${errors.residenceProof2 ? 'border-red-500/50 bg-red-900/10' : 'border-white/20 hover:border-white/50 hover:bg-white/10'}`}
                                    onClick={() => residenceInputRef2.current?.click()}
                                >
                                    <input
                                        ref={residenceInputRef2}
                                        type="file"
                                        accept=".pdf,image/*"
                                        onChange={(e) => handleFileChange(e, 'residenceProof2')}
                                        className="hidden"
                                    />
                                    <div className="p-3 bg-white/10 rounded-full mb-2">
                                        {formData.residenceProof2 ? <Check className="w-5 h-5 text-green-400"/> : <ShieldCheck className="w-5 h-5 text-gray-400"/>}
                                    </div>
                                    <div className="text-center">
                                        {formData.residenceProof2 ? (
                                            <span className="font-medium text-xs text-white break-all">{formData.residenceProof2.name}</span>
                                        ) : (
                                            <span className="text-sm font-medium text-gray-300">Doc #2</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: Matérialité */}
                {currentStep === 4 && (
                <div className="space-y-6">
                    <Input
                    label={t.labels.mediumDimensions}
                    name="mediumDimensions"
                    placeholder={t.placeholders.mediumDimensions}
                    value={formData.mediumDimensions}
                    onChange={handleInputChange}
                    error={errors.mediumDimensions}
                    autoFocus
                    />
                    
                    {/* SECTION IA */}
                    <div className="pt-4 border-t border-white/10">
                        <label className="flex items-start cursor-pointer group mb-4">
                            <div className="relative flex items-center mt-1">
                                <input 
                                    type="checkbox" 
                                    checked={formData.aiUsed}
                                    onChange={(e) => handleCheckboxChange('aiUsed', e.target.checked)}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-400 bg-transparent transition-all checked:border-white checked:bg-white flex-shrink-0"
                                />
                                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100">
                                    <Check className="w-3.5 h-3.5" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <span className="text-base font-medium text-gray-200 group-hover:text-white transition-colors flex items-center">
                                    <Bot className="w-4 h-4 mr-2 text-brand-subtleBlue" />
                                    {t.labels.aiUsed}
                                </span>
                            </div>
                        </label>
                        
                        {formData.aiUsed && (
                             <div className="animate-fade-in pl-9 space-y-4">
                                <TextArea
                                    label={t.labels.aiDetail}
                                    name="aiDetail"
                                    rows={3}
                                    placeholder={t.placeholders.aiDetail}
                                    value={formData.aiDetail}
                                    onChange={handleInputChange}
                                    error={errors.aiDetail}
                                />
                                {/* Disclaimer for AI */}
                                <div className="flex items-start p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
                                    <AlertTriangle className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                                    <span className="text-xs text-red-300">{t.aiDisclaimer}</span>
                                </div>
                             </div>
                        )}
                    </div>

                    <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/10 backdrop-blur-sm mt-4">
                        <p className="text-sm text-gray-300 leading-relaxed">
                            {t.aiNote}
                        </p>
                    </div>
                </div>
                )}

                {/* STEP 5: Métriques */}
                {currentStep === 5 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                    label={t.labels.workHours}
                    name="workHours"
                    type="number"
                    placeholder={t.placeholders.number}
                    value={formData.workHours}
                    onChange={handleInputChange}
                    error={errors.workHours}
                    autoFocus
                    />
                    <Input
                    label={t.labels.materialCost}
                    name="materialCost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.materialCost}
                    onChange={handleInputChange}
                    error={errors.materialCost}
                    />
                    <Input
                    label={t.labels.dryingHours}
                    name="dryingHours"
                    type="number"
                    placeholder={t.placeholders.number}
                    value={formData.dryingHours}
                    onChange={handleInputChange}
                    error={errors.dryingHours}
                    />
                    <Input
                    label={t.labels.travelHours}
                    name="travelHours"
                    type="number"
                    placeholder={t.placeholders.number}
                    value={formData.travelHours}
                    onChange={handleInputChange}
                    error={errors.travelHours}
                    />
                </div>
                )}

                {/* STEP 6: VALORISATION */}
                {currentStep === 6 && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg relative overflow-hidden group backdrop-blur-md">
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="flex items-center space-x-4 relative z-10">
                                <div className="p-3 bg-white/10 rounded-full text-white shadow-inner">
                                    <Calculator className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t.labels.suggestedValue}</p>
                                    <p className="text-3xl font-bold text-white">{calculateRecommendedPrice().toFixed(2)} $</p>
                                </div>
                            </div>
                            <button
                                onClick={applyRecommendedPrice}
                                className="px-6 py-2 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-200 transition-all shadow-lg whitespace-nowrap z-10"
                            >
                                {t.buttons.apply}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <Input
                                label={t.labels.finalPrice}
                                name="finalPrice"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.finalPrice}
                                onChange={handleInputChange}
                                error={errors.finalPrice}
                                autoFocus
                            />
                        </div>

                        {/* Amortization Table Preview */}
                        {typeof formData.finalPrice === 'number' && formData.finalPrice > 0 && (formData.residenceStatus === 'citizen' || formData.residenceStatus === 'permanent') && (
                            <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl space-y-4 backdrop-blur-sm">
                                <h4 className="text-[10px] font-bold uppercase text-gray-400 mb-2 flex items-center tracking-wider">
                                    <DollarSign className="w-3 h-3 mr-1" />
                                    {t.preview.dpaTitle}
                                </h4>
                                
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-400">
                                        <thead className="text-[10px] text-gray-500 uppercase bg-white/5">
                                            <tr>
                                                <th className="px-4 py-2 rounded-l-lg">{t.preview.year}</th>
                                                <th className="px-4 py-2 text-right">{t.preview.deduction}</th>
                                                <th className="px-4 py-2 text-right rounded-r-lg">Solde (UCC)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {calculateFullSchedule(formData.finalPrice).slice(0, 5).map((row) => (
                                                <tr key={row.year} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="px-4 py-2 font-medium text-white">An {row.year}</td>
                                                    <td className="px-4 py-2 text-right text-gray-300">-{row.deduction.toFixed(2)}$</td>
                                                    <td className="px-4 py-2 text-right">{row.ucc.toFixed(2)}$</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 7: Démarche & CV */}
                {currentStep === 7 && (
                <div className="space-y-8">
                    <TextArea
                        label={t.labels.artisticStatement}
                        name="artisticStatement"
                        rows={8}
                        placeholder={t.placeholders.statement}
                        value={formData.artisticStatement}
                        onChange={handleInputChange}
                        error={errors.artisticStatement}
                        autoFocus
                    />
                    
                    <div className="pt-6 border-t border-white/10">
                        <label className="block text-sm font-medium text-gray-300 mb-2 ml-1 tracking-wide">{t.labels.cv}</label>
                        <div 
                            className={`flex flex-col items-center justify-center p-8 border border-dashed rounded-xl cursor-pointer transition-all bg-white/5 backdrop-blur-sm ${errors.artistCV ? 'border-red-500/50 bg-red-900/10' : 'border-white/20 hover:border-white/50 hover:bg-white/10'}`}
                            onClick={() => cvInputRef.current?.click()}
                        >
                            <input
                                ref={cvInputRef}
                                type="file"
                                accept=".pdf,image/*,.doc,.docx"
                                onChange={(e) => handleFileChange(e, 'artistCV')}
                                className="hidden"
                            />
                            <div className="p-4 bg-white/10 rounded-full mb-3 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                {formData.artistCV ? <Check className="w-6 h-6 text-green-400"/> : <FileCheck className="w-6 h-6 text-gray-300"/>}
                            </div>
                            <div className="text-center">
                                {formData.artistCV ? (
                                    <>
                                        <span className="font-medium text-sm text-white block break-all mb-1">{formData.artistCV.name}</span>
                                        <span className="text-xs text-green-400">Prêt</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-base font-medium text-white block mb-1">{t.labels.uploadCV}</span>
                                        <span className="text-xs text-gray-400">PDF / Image</span>
                                    </>
                                )}
                            </div>
                        </div>
                        {errors.artistCV && <p className="mt-2 text-xs text-red-400 ml-1">{errors.artistCV}</p>}
                    </div>
                </div>
                )}

                {/* STEP 8: Visuel */}
                {currentStep === 8 && (
                <div className="space-y-4">
                    <div 
                    className={`
                        relative w-full aspect-[4/3] rounded-3xl border border-dashed
                        flex flex-col items-center justify-center text-center transition-all duration-500
                        group cursor-pointer overflow-hidden backdrop-blur-sm
                        ${errors.image ? 'border-red-500/50 bg-red-900/10' : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'}
                    `}
                    onClick={() => !formData.image && fileInputRef.current?.click()}
                    >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'image')}
                        className="hidden"
                    />
                    
                    {!formData.image ? (
                        <div className="p-8 relative z-10">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/10">
                            <Upload className="w-8 h-8 text-white/80" />
                        </div>
                        <p className="text-xl font-medium text-white">
                            {t.labels.uploadImage}
                        </p>
                        <p className="mt-2 text-sm text-gray-400">
                            JPG / PNG (Max 10MB)
                        </p>
                        </div>
                    ) : (
                        <div className="w-full h-full relative group">
                            <img 
                                src={URL.createObjectURL(formData.image)} 
                                alt="Preview" 
                                className="w-full h-full object-contain p-4"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFormData(prev => ({...prev, image: null}));
                                        if(fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                    className="px-6 py-3 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-200"
                                >
                                    {t.labels.changeImage}
                                </button>
                            </div>
                        </div>
                    )}
                    </div>
                    {errors.image && <p className="text-sm text-red-400 text-center font-medium">{errors.image}</p>}
                </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-auto flex items-center justify-between pt-8 border-t border-white/10 relative z-10">
                <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`
                    flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5
                    ${currentStep === 0 ? 'opacity-0 cursor-not-allowed' : 'opacity-100'}
                `}
                >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.buttons.back}
                </button>

                <button
                onClick={handleNext}
                className="group btn-shine flex items-center space-x-2 bg-white text-black px-8 py-4 rounded-full font-bold text-base hover:bg-gray-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:-translate-y-0.5"
                >
                    <>
                    <span>{currentStep === stepsList.length - 1 ? t.buttons.generate : t.buttons.next}</span>
                    {currentStep !== stepsList.length - 1 && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </>
                </button>
            </div>

            {status === SubmissionStatus.ERROR && (
            <div className="mt-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl flex items-start space-x-3 animate-fade-in relative z-10 backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-400">
                <span className="font-semibold block mb-1">{t.preview.error}</span>
                {errorMessage}
                </div>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};