import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';
import { assignTagsToPrompt, getAllCategories } from '../../../utils/promptTags';

export async function GET() {
  try {
    console.log('Fetching prompts from database...');
    
    // Fetch all prompts
    const { data: prompts, error } = await supabase
      .from('image_prompts')
      .select('prompt_id, prompt_text, created_at, user, tela, estructura')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching prompts:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`Found ${prompts.length} prompts`);

    // Analyze prompt texts
    const allPromptTexts = prompts
      .map((p: { prompt_text?: string }) => p.prompt_text)
      .filter((text: string | undefined): text is string => text !== undefined && text.trim() !== '');

    console.log(`Analyzing ${allPromptTexts.length} non-empty prompts...`);

    // Word frequency analysis
    const wordCounts: { [key: string]: number } = {};
    const phrases: string[] = [];

    allPromptTexts.forEach((prompt: string) => {
      // Clean and normalize text
      const cleanText = prompt
        .toLowerCase()
        .replace(/[^\w\sáéíóúñü]/g, '') // Remove punctuation but keep Spanish characters
        .trim();

      // Extract individual words
      const words = cleanText.split(/\s+/);
      words.forEach((word: string) => {
        if (word.length > 2) { // Ignore very short words
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
      });

      // Extract potential phrases (2-3 words)
      for (let i = 0; i < words.length - 1; i++) {
        const phrase2 = `${words[i]} ${words[i + 1]}`;
        const phrase3 = i < words.length - 2 ? `${words[i]} ${words[i + 1]} ${words[i + 2]}` : null;
        
        if (phrase2.length > 5) phrases.push(phrase2);
        if (phrase3 && phrase3.length > 8) phrases.push(phrase3);
      }
    });

    // Sort words by frequency
    const sortedWords = Object.entries(wordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 100); // Top 100 words

    // Analyze phrases
    const phraseCounts: { [key: string]: number } = {};
    phrases.forEach((phrase: string) => {
      phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
    });

    const sortedPhrases = Object.entries(phraseCounts)
      .filter(([,count]) => count > 1) // Only phrases that appear more than once
      .sort(([,a], [,b]) => b - a)
      .slice(0, 50); // Top 50 phrases

    // Assign tags to all prompts
    interface PromptWithTags {
      prompt_text: string;
      user?: string;
      tela?: string;
      estructura?: string;
      assignedTags: string[];
    }

    const promptsWithTags: PromptWithTags[] = prompts.map((prompt: { prompt_text: string; user?: string; tela?: string; estructura?: string }) => ({
      ...prompt,
      assignedTags: assignTagsToPrompt(prompt.prompt_text)
    }));

    // Get all assigned tags across all prompts
    const allAssignedTags = [...new Set(
      promptsWithTags.flatMap((p) => p.assignedTags)
    )];

    // Create analysis report
    const analysis = {
      totalPrompts: prompts.length,
      nonEmptyPrompts: allPromptTexts.length,
      topWords: sortedWords,
      topPhrases: sortedPhrases,
      samplePrompts: allPromptTexts.slice(0, 10), // First 10 prompts for context
      uniqueUsers: [...new Set(prompts.map((p: { user?: string }) => p.user).filter(Boolean))],
      uniqueTelas: [...new Set(prompts.map((p: { tela?: string }) => p.tela).filter(Boolean))],
      uniqueEstructuras: [...new Set(prompts.map((p: { estructura?: string }) => p.estructura).filter(Boolean))],
      promptsWithTags: promptsWithTags.slice(0, 20), // Sample of prompts with tags
      allAssignedTags: allAssignedTags.sort(),
      tagCategories: getAllCategories(),
      tagStats: allAssignedTags.map(tag => ({
        tag,
        count: promptsWithTags.filter((p) => p.assignedTags.includes(tag)).length
      })).sort((a, b) => b.count - a.count)
    };

    return NextResponse.json(analysis, { status: 200 });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}