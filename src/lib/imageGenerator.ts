import { supabase } from "./supabase";

export interface GenerateImageOptions {
  prompt: string;
}

export interface GenerateImageResult {
  imageUrl: string;
  error?: string;
}

export async function generateImage(options: GenerateImageOptions): Promise<GenerateImageResult> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-image', {
      body: { prompt: options.prompt }
    });

    if (error) {
      console.error('Error invoking generate-image function:', error);
      return { imageUrl: '', error: error.message };
    }

    if (data.error) {
      console.error('Error from generate-image function:', data.error);
      return { imageUrl: '', error: data.error };
    }

    return { imageUrl: data.imageUrl };
  } catch (error) {
    console.error('Unexpected error generating image:', error);
    return { 
      imageUrl: '', 
      error: error instanceof Error ? error.message : 'Failed to generate image' 
    };
  }
}
