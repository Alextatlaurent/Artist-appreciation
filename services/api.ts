import { SubmissionFormState, WebhookResponse, AmortizationYear } from '../types';
import { GoogleGenAI } from "@google/genai";

// URL DE VOTRE SCRIPT GOOGLE
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzc3rc8xVtOrF0jWc3IygvmRNxt-gjSHSQeQs175AqpewgBTvtECQ04YnfV4FvJ4eBu/exec"; 

// ID du dossier Google Drive spécifique pour le Salon des Inconnus
const DRIVE_FOLDER_ID = "132vP2M2eymO4xnHyZq7Ob0MUOn25kyB3";

// Fonction utilitaire pour convertir un File en Base64
const fileToB64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Fonction helper pour recalculer l'amortissement coté service si besoin, 
// ou on peut le passer depuis le front. Ici on le recalcule pour être sûr.
const generateAmortizationSchedule = (price: number): AmortizationYear[] => {
    const schedule: AmortizationYear[] = [];
    let ucc = price;
    let year = 1;
    
    // On boucle tant qu'il reste de la valeur significative (ex: > 10$)
    // ou une limite de sécurité (ex: 20 ans)
    while (ucc > 10 && year <= 20) {
        let rate = 0.20; // Taux de base Catégorie 8
        if (year === 1) rate = 0.10; // Règle demi-année (15% effectif sur certains cas, mais standard comptable simplifié 10% sur acquisition)

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

// Update to accept optional sheet image
export const submitArtwork = async (data: SubmissionFormState, finalSheetImage?: string): Promise<WebhookResponse> => {
  console.group("🎨 Traitement du dossier");
  
  let galleryImageUrl = "";

  try {
    // 1. GÉNÉRATION DE L'IMAGE VIA GEMINI (IA)
    if (data.image) {
      console.log("🤖 Génération de la mise en situation avec Gemini...");
      
      // Sécurité : Accès conditionnel à process pour éviter "ReferenceError: process is not defined"
      const apiKey = typeof process !== "undefined" ? process.env.API_KEY : undefined;
      
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        // Pour Gemini SDK, on a besoin du raw base64 sans le header
        const fullB64 = await fileToB64(data.image);
        const rawB64 = fullB64.split(',')[1]; 

        const prompt = "A photorealistic wide shot of a pristine, high-end modern art gallery with concrete walls and dramatic lighting. In the center hangs EXACTLY the provided artwork image. The artwork is framed in a sleek black floater frame. 8k resolution, cinematic lighting.";

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { inlineData: { mimeType: data.image.type || 'image/png', data: rawB64 } },
              { text: prompt }
            ]
          }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
              galleryImageUrl = `data:image/png;base64,${part.inlineData.data}`;
              break;
          }
        }
      } else {
        console.warn("Clé API Gemini manquante ou environnement non configuré. Saut de la génération d'image.");
      }
    }

    // 2. PRÉPARATION DES DONNÉES POUR GOOGLE APPS SCRIPT
    if (!GOOGLE_SCRIPT_URL) {
        console.warn("⚠️ Aucune URL de script Google configurée. Mode simulation activé.");
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            success: true,
            message: "Simulation: Dossier traité (Script URL manquant).",
            galleryImageUrl: galleryImageUrl
        };
    }

    console.log("📤 Envoi des données vers Google Drive/Gmail...");

    // Conversion des fichiers pour l'envoi JSON
    const artworkB64 = data.image ? await fileToB64(data.image) : null;
    const proof1B64 = data.residenceProof1 ? await fileToB64(data.residenceProof1) : null;
    const proof2B64 = data.residenceProof2 ? await fileToB64(data.residenceProof2) : null;
    const cvB64 = data.artistCV ? await fileToB64(data.artistCV) : null;

    // Calcul DPA pour le backend
    const price = typeof data.finalPrice === 'number' ? data.finalPrice : 0;
    const amortizationSchedule = generateAmortizationSchedule(price);

    // Concatenate Medium if 'Autre'
    const finalMedium = data.mediumCategory === 'Autre' && data.mediumDetail 
      ? `Autre: ${data.mediumDetail}` 
      : data.mediumCategory;

    if (finalSheetImage) {
        console.log("📄 Fiche officielle incluse dans le paquet.");
    }

    const payload = {
        driveFolderId: DRIVE_FOLDER_ID,
        folderName: `${data.artistName} - ${data.artworkTitle}`,
        artistName: data.artistName,
        email: data.email,
        emailCC: data.emailCC, // Envoi du 2eme courriel
        phone: data.phone,
        artworkTitle: data.artworkTitle,
        details: {
            address: data.address,
            dimensions: data.mediumDimensions,
            hours: data.workHours,
            price: data.finalPrice,
            materialCost: data.materialCost,
            statement: data.artisticStatement,
            aiUsed: data.aiUsed,
            aiDetail: data.aiDetail,
            eligibility: {
                residence: data.residenceStatus,
                medium: finalMedium,
                compliant: data.complianceChecked
            },
            amortizationSchedule: amortizationSchedule // Données complètes DPA pour le PDF
        },
        files: [
            data.image ? {
                name: `Oeuvre - ${data.image.name}`,
                mimeType: data.image.type,
                data: artworkB64?.split(',')[1]
            } : null,
            data.artistCV ? {
                name: `CV - ${data.artistCV.name}`,
                mimeType: data.artistCV.type,
                data: cvB64?.split(',')[1]
            } : null,
            data.residenceProof1 ? {
                name: `Preuve ID 1 - ${data.residenceProof1.name}`,
                mimeType: data.residenceProof1.type,
                data: proof1B64?.split(',')[1]
            } : null,
            data.residenceProof2 ? {
                name: `Preuve ID 2 - ${data.residenceProof2.name}`,
                mimeType: data.residenceProof2.type,
                data: proof2B64?.split(',')[1]
            } : null,
            galleryImageUrl ? {
                name: "01_VISUEL_PRINCIPAL_Mise_en_situation.png",
                mimeType: "image/png",
                data: galleryImageUrl.split(',')[1]
            } : null,
            finalSheetImage ? {
                name: "00_FICHE_OFFICIELLE.png",
                mimeType: "image/png",
                data: finalSheetImage.split(',')[1]
            } : null
        ].filter(f => f !== null)
    };

    // Envoi via fetch avec mode: 'no-cors' pour éviter les erreurs "Failed to fetch"
    // liées aux redirections Google Apps Script et au CORS.
    await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload)
    });

    console.log("✅ Envoi effectué (Mode no-cors).");

    console.groupEnd();
    return {
      success: true,
      message: "Dossier envoyé et traité.",
      galleryImageUrl: galleryImageUrl
    };

  } catch (error: any) {
    console.error("Erreur critique:", error);
    // Même en cas d'erreur réseau majeure, on ne veut pas bloquer l'utilisateur
    throw new Error("Erreur lors de l'envoi du dossier: " + error.message);
  }
};