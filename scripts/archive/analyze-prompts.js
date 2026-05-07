const fs = require('fs');

// We'll create a simple test with hardcoded connection for now
// You can replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://your-project.supabase.co'; // Replace with actual URL
const SUPABASE_ANON_KEY = 'your-anon-key'; // Replace with actual key

// For now, let's create a mock analysis to demonstrate the concept
console.log('Note: This is running with mock data for demonstration.');
console.log('Please provide your Supabase credentials to analyze real data.');

async function analyzePrompts() {
  try {
    console.log('Fetching prompts from database...');
    
    // Fetch all prompts
    const { data: prompts, error } = await supabase
      .from('image_prompts')
      .select('prompt_id, prompt_text, created_at, user, tela, estructura')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching prompts:', error);
      return;
    }

    console.log(`Found ${prompts.length} prompts`);
    
    // Save raw data for inspection
    fs.writeFileSync('prompts_raw_data.json', JSON.stringify(prompts, null, 2));
    console.log('Raw data saved to prompts_raw_data.json');

    // Analyze prompt texts
    const allPromptTexts = prompts
      .map(p => p.prompt_text)
      .filter(text => text && text.trim() !== '');

    console.log(`Analyzing ${allPromptTexts.length} non-empty prompts...`);

    // Word frequency analysis
    const wordCounts = {};
    const phrases = [];

    allPromptTexts.forEach(prompt => {
      // Clean and normalize text
      const cleanText = prompt
        .toLowerCase()
        .replace(/[^\w\sáéíóúñü]/g, '') // Remove punctuation but keep Spanish characters
        .trim();

      // Extract individual words
      const words = cleanText.split(/\s+/);
      words.forEach(word => {
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
    const phraseCounts = {};
    phrases.forEach(phrase => {
      phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
    });

    const sortedPhrases = Object.entries(phraseCounts)
      .filter(([,count]) => count > 1) // Only phrases that appear more than once
      .sort(([,a], [,b]) => b - a)
      .slice(0, 50); // Top 50 phrases

    // Create analysis report
    const analysis = {
      totalPrompts: prompts.length,
      nonEmptyPrompts: allPromptTexts.length,
      topWords: sortedWords,
      topPhrases: sortedPhrases,
      samplePrompts: allPromptTexts.slice(0, 10), // First 10 prompts for context
      uniqueUsers: [...new Set(prompts.map(p => p.user).filter(Boolean))],
      uniqueTelas: [...new Set(prompts.map(p => p.tela).filter(Boolean))],
      uniqueEstructuras: [...new Set(prompts.map(p => p.estructura).filter(Boolean))]
    };

    // Save analysis
    fs.writeFileSync('prompt_analysis.json', JSON.stringify(analysis, null, 2));
    console.log('Analysis saved to prompt_analysis.json');

    // Print summary
    console.log('\n=== ANALYSIS SUMMARY ===');
    console.log(`Total prompts: ${analysis.totalPrompts}`);
    console.log(`Non-empty prompts: ${analysis.nonEmptyPrompts}`);
    console.log(`Unique users: ${analysis.uniqueUsers.length}`);
    console.log(`Unique fabrics (tela): ${analysis.uniqueTelas.length}`);
    console.log(`Unique structures (estructura): ${analysis.uniqueEstructuras.length}`);

    console.log('\nTop 20 most common words:');
    analysis.topWords.slice(0, 20).forEach(([word, count], i) => {
      console.log(`${i + 1}. ${word} (${count})`);
    });

    console.log('\nTop 10 most common phrases:');
    analysis.topPhrases.slice(0, 10).forEach(([phrase, count], i) => {
      console.log(`${i + 1}. "${phrase}" (${count})`);
    });

    console.log('\nSample prompts:');
    analysis.samplePrompts.slice(0, 5).forEach((prompt, i) => {
      console.log(`${i + 1}. ${prompt.substring(0, 100)}...`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the analysis
analyzePrompts();