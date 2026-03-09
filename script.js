class AITranslator {
    constructor() {
        // Initialize language mappings first
        this.languageMap = {
            'auto': 'Auto Detect',
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh': 'Chinese',
            'ar': 'Arabic',
            'hi': 'Hindi',
            'te': 'Telugu',
            'ta': 'Tamil',
            'bn': 'Bengali',
            'gu': 'Gujarati',
            'mr': 'Marathi',
            'pa': 'Punjabi',
            'ml': 'Malayalam',
            'kn': 'Kannada',
            'or': 'Oriya',
            'as': 'Assamese'
        };
        
        this.maxCharacters = 5000;
        this.initializeElements();
        this.bindEvents();
        this.loadHistory();
    }

    initializeElements() {
        this.sourceLanguage = document.getElementById('sourceLanguage');
        this.targetLanguage = document.getElementById('targetLanguage');
        this.sourceText = document.getElementById('sourceText');
        this.translatedText = document.getElementById('translatedText');
        this.translateBtn = document.getElementById('translateBtn');
        this.swapBtn = document.getElementById('swapLanguages');
        this.clearBtn = document.getElementById('clearText');
        this.copyBtn = document.getElementById('copyTranslation');
        this.speakBtn = document.getElementById('speakTranslation');
        this.voiceInputBtn = document.getElementById('voiceInputBtn');
        this.charCount = document.getElementById('charCount');
        this.detectedLanguage = document.getElementById('detectedLanguage');
        this.detectedLangName = document.getElementById('detectedLangName');
        this.historyList = document.getElementById('historyList');
        this.clearHistoryBtn = document.getElementById('clearHistory');
        this.btnText = this.translateBtn.querySelector('.btn-text');
        this.loadingSpinner = this.translateBtn.querySelector('.loading-spinner');
        
        // Translation insights elements
        this.translationInsights = document.getElementById('translationInsights');
        this.confidenceFill = document.getElementById('confidenceFill');
        this.confidenceValue = document.getElementById('confidenceValue');
        this.toneValue = document.getElementById('toneValue');
        this.grammarBtn = document.getElementById('grammarBtn');
        
        // Grammar modal elements
        this.grammarModal = document.getElementById('grammarModal');
        this.closeGrammarModalBtn = document.getElementById('closeGrammarModal');
        this.sourceGrammarContent = document.getElementById('sourceGrammarContent');
        this.learningContent = document.getElementById('learningContent');
        this.tipsContent = document.getElementById('tipsContent');
        
        // API Key elements
        this.apiKeySection = document.getElementById('apiKeySection');
        this.apiKeyInput = document.getElementById('apiKeyInput');
        this.saveApiKeyBtn = document.getElementById('saveApiKey');
        
        // Speech recognition
        this.recognition = null;
        this.isRecording = false;
    }

    bindEvents() {
        this.translateBtn.addEventListener('click', () => this.translate());
        this.swapBtn.addEventListener('click', () => this.swapLanguages());
        this.clearBtn.addEventListener('click', () => this.clearText());
        this.copyBtn.addEventListener('click', () => this.copyTranslation());
        this.speakBtn.addEventListener('click', () => this.speakTranslation());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        this.saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());
        this.voiceInputBtn.addEventListener('click', () => this.toggleVoiceInput());
        this.grammarBtn.addEventListener('click', () => this.showGrammarAnalysis());
        this.closeGrammarModalBtn.addEventListener('click', () => this.closeGrammarModal());
        
        this.sourceText.addEventListener('input', () => this.updateCharCount());
        this.sourceText.addEventListener('paste', () => {
            setTimeout(() => this.updateCharCount(), 10);
        });
        
        // Auto-translate on Enter key (with Ctrl/Cmd)
        this.sourceText.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.translate();
            }
        });

        // Initialize API key UI
        this.initializeApiKeyUI();
        
        // Initialize speech recognition
        this.initializeSpeechRecognition();
    }

    initializeApiKeyUI() {
        const savedKey = localStorage.getItem('openrouter_api_key');
        
        if (savedKey) {
            this.apiKeyInput.value = savedKey;
            this.apiKeySection.classList.add('has-key');
            this.saveApiKeyBtn.textContent = 'Update Key';
        } else {
            this.apiKeySection.classList.remove('has-key');
            this.saveApiKeyBtn.textContent = 'Save Key';
        }
    }

    saveApiKey() {
        const apiKey = this.apiKeyInput.value.trim();
        
        if (!apiKey) {
            alert('Please enter an API key');
            return;
        }

        if (!apiKey.startsWith('sk-or-v1-')) {
            alert('Invalid API key format. OpenRouter keys start with "sk-or-v1-"');
            return;
        }

        localStorage.setItem('openrouter_api_key', apiKey);
        this.apiKeySection.classList.add('has-key');
        this.saveApiKeyBtn.textContent = 'Update Key';
        
        // Show success feedback
        const originalText = this.saveApiKeyBtn.textContent;
        this.saveApiKeyBtn.textContent = '✓ Saved';
        this.saveApiKeyBtn.style.background = '#28a745';
        
        setTimeout(() => {
            this.saveApiKeyBtn.textContent = originalText;
            this.saveApiKeyBtn.style.background = '';
        }, 2000);
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US'; // Default language
            
            this.recognition.onstart = () => {
                this.isRecording = true;
                this.voiceInputBtn.classList.add('recording');
                this.voiceInputBtn.textContent = '🔴';
            };
            
            this.recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                
                if (event.results[event.results.length - 1].isFinal) {
                    this.sourceText.value = transcript;
                    this.updateCharCount();
                    this.stopRecording();
                } else {
                    // Show interim results
                    this.sourceText.value = transcript;
                    this.updateCharCount();
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.stopRecording();
                
                if (event.error === 'no-speech') {
                    alert('No speech detected. Please try again.');
                } else if (event.error === 'not-allowed') {
                    alert('Microphone access denied. Please allow microphone access.');
                } else {
                    alert('Speech recognition error: ' + event.error);
                }
            };
            
            this.recognition.onend = () => {
                this.stopRecording();
            };
        } else {
            this.voiceInputBtn.style.display = 'none';
            console.warn('Speech recognition not supported in this browser');
        }
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            alert('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
            return;
        }
        
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    startRecording() {
        if (this.recognition && !this.isRecording) {
            this.recognition.start();
        }
    }

    stopRecording() {
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
            this.isRecording = false;
            this.voiceInputBtn.classList.remove('recording');
            this.voiceInputBtn.textContent = '🎤';
        }
    }

    analyzeTranslation(originalText, translatedText, sourceLang, targetLang) {
        // Calculate confidence based on various factors
        let confidence = 85; // Base confidence
        
        // Adjust confidence based on text length
        if (originalText.length < 10) confidence -= 10;
        else if (originalText.length > 100) confidence -= 5;
        
        // Adjust confidence based on language similarity
        const similarLanguages = [
            ['en', 'es'], ['en', 'fr'], ['en', 'de'], ['es', 'fr'], ['es', 'pt'], ['hi', 'te'], ['hi', 'mr']
        ];
        
        const isSimilar = similarLanguages.some(pair => 
            (pair.includes(sourceLang) && pair.includes(targetLang))
        );
        
        if (isSimilar) confidence += 5;
        else confidence -= 5;
        
        // Adjust confidence based on special characters
        const hasSpecialChars = /[^\w\s\u0c00-\u0c7f\u0900-\u097f]/.test(originalText);
        if (hasSpecialChars) confidence -= 10;
        
        // Ensure confidence is within bounds
        confidence = Math.max(60, Math.min(95, confidence));
        
        // Detect tone
        const tone = this.detectTone(originalText, translatedText);
        
        return { confidence, tone };
    }

    detectTone(originalText, translatedText) {
        const text = originalText.toLowerCase();
        
        // Formal indicators
        const formalIndicators = [
            'dear', 'sincerely', 'respectfully', 'regards', 'yours truly',
            'mr.', 'mrs.', 'dr.', 'prof.', 'sir', 'madam', 'please',
            'thank you', 'grateful', 'appreciate', 'would you', 'could you'
        ];
        
        // Informal indicators
        const informalIndicators = [
            'hey', 'hi', 'yo', 'what\'s up', 'sup', 'gonna', 'wanna',
            'gotta', 'kinda', 'sorta', 'yeah', 'nah', 'lol', 'omg',
            'btw', 'fyi', 'idk', 'tbh', 'imho', 'asap'
        ];
        
        // Professional indicators
        const professionalIndicators = [
            'furthermore', 'moreover', 'therefore', 'consequently',
            'implementation', 'optimization', 'strategic', 'synergy',
            'leverage', 'paradigm', 'methodology', 'framework'
        ];
        
        let formalScore = 0;
        let informalScore = 0;
        let professionalScore = 0;
        
        formalIndicators.forEach(indicator => {
            if (text.includes(indicator)) formalScore++;
        });
        
        informalIndicators.forEach(indicator => {
            if (text.includes(indicator)) informalScore++;
        });
        
        professionalIndicators.forEach(indicator => {
            if (text.includes(indicator)) professionalScore++;
        });
        
        // Determine tone based on scores
        if (professionalScore > 0) return 'professional';
        if (formalScore > informalScore) return 'formal';
        if (informalScore > formalScore) return 'informal';
        
        return 'neutral';
    }

    updateTranslationInsights(confidence, tone) {
        // Update confidence
        this.confidenceFill.style.width = confidence + '%';
        this.confidenceValue.textContent = confidence + '%';
        
        // Update confidence bar color
        if (confidence >= 80) {
            this.confidenceFill.style.background = '#28a745';
        } else if (confidence >= 60) {
            this.confidenceFill.style.background = '#ffc107';
        } else {
            this.confidenceFill.style.background = '#dc3545';
        }
        
        // Update tone
        this.toneValue.textContent = tone.charAt(0).toUpperCase() + tone.slice(1);
        this.toneValue.className = 'tone-value ' + tone;
        
        // Show insights
        this.translationInsights.style.display = 'block';
    }

    showGrammarAnalysis() {
        if (!this.sourceText.value.trim() || !this.translatedText.value.trim()) {
            alert('Please translate some text first to analyze grammar.');
            return;
        }

        this.grammarModal.style.display = 'flex';
        this.analyzeGrammar();
    }

    closeGrammarModal() {
        this.grammarModal.style.display = 'none';
    }

    async analyzeGrammar() {
        const sourceText = this.sourceText.value.trim();
        const sourceLang = this.sourceLanguage.value === 'auto' ? this.detectLanguageFromText(sourceText) : this.sourceLanguage.value;

        // Show loading state
        this.sourceGrammarContent.innerHTML = '<div class="loading-grammar">Analyzing grammar...</div>';
        this.learningContent.innerHTML = '<div class="loading-grammar">Generating learning focus...</div>';
        this.tipsContent.innerHTML = '<div class="loading-grammar">Creating practice tips...</div>';

        try {
            // Analyze source grammar
            const sourceAnalysis = await this.analyzeTextGrammar(sourceText, sourceLang);
            this.sourceGrammarContent.innerHTML = this.formatGrammarAnalysis(sourceAnalysis, sourceLang);

            // Generate learning focus
            const learningFocus = this.generateLearningFocus(sourceAnalysis, sourceLang);
            this.learningContent.innerHTML = learningFocus;

            // Generate practice tips
            const tips = this.generatePracticeTips(sourceAnalysis, sourceLang);
            this.tipsContent.innerHTML = tips;

        } catch (error) {
            console.error('Grammar analysis error:', error);
            this.sourceGrammarContent.innerHTML = '<p>Error analyzing grammar. Please try again.</p>';
            this.learningContent.innerHTML = '<p>Error generating learning focus.</p>';
            this.tipsContent.innerHTML = '<p>Error creating practice tips.</p>';
        }
    }

    async analyzeTextGrammar(text, language) {
        // Simulate API delay for grammar analysis
        await new Promise(resolve => setTimeout(resolve, 1000));

        const analysis = {
            sentenceType: this.detectSentenceType(text),
            tense: this.detectTense(text, language),
            partsOfSpeech: this.analyzePartsOfSpeech(text, language),
            structure: this.analyzeSentenceStructure(text, language),
            complexity: this.assessComplexity(text, language),
            commonPatterns: this.identifyPatterns(text, language)
        };

        return analysis;
    }

    detectSentenceType(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim());
        const types = new Set();

        sentences.forEach(sentence => {
            const trimmed = sentence.trim().toLowerCase();
            
            // Check for question indicators
            if (trimmed.includes('?') || 
                trimmed.startsWith('what') || 
                trimmed.startsWith('where') || 
                trimmed.startsWith('when') || 
                trimmed.startsWith('why') || 
                trimmed.startsWith('how') || 
                trimmed.startsWith('who') || 
                trimmed.startsWith('which') || 
                trimmed.startsWith('whose') || 
                trimmed.startsWith('whom') ||
                trimmed.startsWith('are') || 
                trimmed.startsWith('is') || 
                trimmed.startsWith('am') || 
                trimmed.startsWith('do') || 
                trimmed.startsWith('does') || 
                trimmed.startsWith('did') ||
                trimmed.startsWith('can') || 
                trimmed.startsWith('could') || 
                trimmed.startsWith('would') || 
                trimmed.startsWith('should') || 
                trimmed.startsWith('will') || 
                trimmed.startsWith('shall') ||
                trimmed.endsWith('?')) {
                types.add('interrogative');
            }
            // Check for exclamatory indicators
            else if (trimmed.includes('!') || 
                     trimmed.startsWith('what') || 
                     trimmed.startsWith('how') || 
                     trimmed.startsWith('wow') || 
                     trimmed.startsWith('oh') ||
                     trimmed.endsWith('!')) {
                types.add('exclamatory');
            }
            // Check for imperative indicators
            else if (trimmed.match(/^(please|go|come|stop|start|run|walk|eat|sleep|work|play|study|read|write|speak|listen|look|watch|try|help|give|take|make|do|have|be|let|don't)/)) {
                types.add('imperative');
            }
            else {
                types.add('declarative');
            }
        });

        return types.size > 0 ? Array.from(types) : ['declarative'];
    }

    detectTense(text, language) {
        const tensePatterns = {
            'en': {
                present: /\b(am|is|are|go|goes|have|has|do|does|walk|walks)\b/i,
                past: /\b(was|were|went|had|did|walked)\b/i,
                future: /\b(will|shall|going to)\b/i
            },
            'es': {
                present: /\b( soy|eres|es|somos|sois|son|voy|vas|va|vamos|vais|van|tengo|tienes|tiene)\b/i,
                past: /\b(fui|fuiste|fue|fuimos|fuisteis|fueron|era|eras|éramos|erais|eran)\b/i,
                future: /\b(voy a|vas a|va a|vamos a|vais a|van a)\b/i
            },
            'fr': {
                present: /\b(suis|es|est|sommes|êtes|sont|vais|vas|va|allons|allez|vont|ai|as|a|avons|avez|ont)\b/i,
                past: /\b(étais|étais|était|étions|étiez|étaient|allai|allas|alla|allâmes|allâtes|allèrent)\b/i,
                future: /\b(serai|seras|sera|serons|serez|seront|irai|iras|ira|irons|irez|iront)\b/i
            }
        };

        const patterns = tensePatterns[language] || tensePatterns['en'];
        const detectedTenses = [];

        Object.keys(patterns).forEach(tense => {
            if (patterns[tense].test(text)) {
                detectedTenses.push(tense);
            }
        });

        return detectedTenses.length > 0 ? detectedTenses : ['present'];
    }

    analyzePartsOfSpeech(text, language) {
        const posPatterns = {
            'en': {
                nouns: /\b(cat|dog|house|car|book|table|water|food|person|time)\b/gi,
                verbs: /\b(run|walk|eat|sleep|work|play|study|read|write|speak|go|come|see|hear|think|know)\b/gi,
                adjectives: /\b(big|small|good|bad|happy|sad|beautiful|ugly|hot|cold|new|old|young|fast|slow)\b/gi,
                adverbs: /\b(quickly|slowly|carefully|happily|sadly|very|quite|rather|too|also|always|never)\b/gi
            },
            'es': {
                nouns: /\b(gato|perro|casa|coche|libro|mesa|agua|comida|persona|tiempo)\b/gi,
                verbs: /\b(corro|corres|corre|corremos|corréis|corren|como|comes|come|comemos|coméis|comen)\b/gi,
                adjectives: /\b(grande|pequeño|bueno|malo|feliz|triste|hermoso|feo|caliente|frío|nuevo|viejo)\b/gi,
                adverbs: /\b(rápidamente|lentamente|cuidadosamente|felizmente|tristemente|muy|bastante|también|siempre|nunca)\b/gi
            }
        };

        const patterns = posPatterns[language] || posPatterns['en'];
        const analysis = {};

        Object.keys(patterns).forEach(pos => {
            const matches = text.match(patterns[pos]);
            analysis[pos] = matches ? [...new Set(matches.map(m => m.toLowerCase()))] : [];
        });

        return analysis;
    }

    analyzeSentenceStructure(text, language) {
        const structure = {
            wordCount: text.split(/\s+/).length,
            sentenceCount: text.split(/[.!?]+/).filter(s => s.trim()).length,
            avgWordsPerSentence: 0,
            hasComplexStructures: false,
            hasQuestions: text.includes('?'),
            hasExclamations: text.includes('!')
        };

        structure.avgWordsPerSentence = Math.round(structure.wordCount / structure.sentenceCount * 10) / 10;
        
        // Check for complex structures
        const complexIndicators = [
            /\b(because|although|however|therefore|moreover|furthermore|nevertheless|consequently)\b/i,
            /\b(which|who|whom|whose|that|where|when|why|how)\b/,
            /\,\s*\w+\s*\,/, // comma in middle
            /\s+\-\s+/ // dash
        ];

        structure.hasComplexStructures = complexIndicators.some(pattern => pattern.test(text));

        return structure;
    }

    assessComplexity(text, language) {
        const structure = this.analyzeSentenceStructure(text, language);
        let complexity = 'simple';

        if (structure.avgWordsPerSentence > 15 || structure.hasComplexStructures) {
            complexity = 'complex';
        } else if (structure.avgWordsPerSentence > 8) {
            complexity = 'moderate';
        }

        return complexity;
    }

    identifyPatterns(text, language) {
        const patterns = {
            'en': [
                { name: 'Present Perfect', pattern: /\b(have|has)\s+\w+ed\b/i, example: 'I have finished' },
                { name: 'Passive Voice', pattern: /\b(am|is|are|was|were)\s+\w+ed\b/i, example: 'The book was written' },
                { name: 'Conditional', pattern: /\b(would|could|should)\b/i, example: 'I would go' }
            ],
            'es': [
                { name: 'Pretérito Perfecto', pattern: /\b(he|has|ha|hemos|habéis|han)\s+\w+ado\b/i, example: 'He terminado' },
                { name: 'Voz Pasiva', pattern: /\b(fui|fuiste|fue|fuimos|fuisteis|fueron)\s+\w+ado\b/i, example: 'Fue escrito' },
                { name: 'Condicional', pattern: /\b(would|could|should)\b/i, example: 'I would go' }
            ]
        };

        const langPatterns = patterns[language] || patterns['en'];
        const foundPatterns = [];

        langPatterns.forEach(patternObj => {
            if (patternObj.pattern.test(text)) {
                foundPatterns.push(patternObj);
            }
        });

        return foundPatterns;
    }

    formatGrammarAnalysis(analysis, language) {
        const langName = this.languageMap[language] || language;
        
        let html = `
            <div class="grammar-point">
                <strong>Sentence Type:</strong> ${analysis.sentenceType.join(', ')}
            </div>
            <div class="grammar-point">
                <strong>Tense:</strong> ${analysis.tense.join(', ')}
            </div>
            <div class="grammar-point">
                <strong>Complexity:</strong> ${analysis.complexity}
            </div>
            <div class="grammar-point">
                <strong>Structure:</strong> ${analysis.structure.wordCount} words, ${analysis.structure.sentenceCount} sentences
            </div>
        `;

        // Add parts of speech
        const posList = [];
        Object.keys(analysis.partsOfSpeech).forEach(pos => {
            if (analysis.partsOfSpeech[pos].length > 0) {
                posList.push(`<strong>${pos}:</strong> ${analysis.partsOfSpeech[pos].slice(0, 5).join(', ')}`);
            }
        });

        if (posList.length > 0) {
            html += `<div class="grammar-point">${posList.join('<br>')}</div>`;
        }

        // Add patterns
        if (analysis.commonPatterns.length > 0) {
            html += '<div class="grammar-point"><strong>Grammar Patterns:</strong><br>';
            analysis.commonPatterns.forEach(pattern => {
                html += `<div class="grammar-example">${pattern.name}: ${pattern.example}</div>`;
            });
            html += '</div>';
        }

        return html;
    }

    generateLearningFocus(analysis, language) {
        const langName = this.languageMap[language] || language;
        
        let focus = `
            <div class="grammar-point">
                <strong>Language Focus:</strong> ${langName} Grammar
            </div>
            <div class="grammar-point">
                <strong>Key Structures:</strong> 
                ${analysis.sentenceType.join(', ')} sentences with ${analysis.tense.join(', ')} tense
            </div>
        `;

        // Add specific focus areas based on analysis
        if (analysis.complexity === 'simple') {
            focus += `
                <div class="grammar-tip">
                    <strong>Focus Area:</strong> Basic sentence structure - perfect for beginners!
                </div>
            `;
        } else if (analysis.complexity === 'moderate') {
            focus += `
                <div class="grammar-tip">
                    <strong>Focus Area:</strong> Intermediate structures - good for expanding your skills!
                </div>
            `;
        } else {
            focus += `
                <div class="grammar-tip">
                    <strong>Focus Area:</strong> Advanced structures - challenge yourself with complex grammar!
                </div>
            `;
        }

        // Add pattern focus
        if (analysis.commonPatterns.length > 0) {
            focus += `
                <div class="grammar-point">
                    <strong>Important Pattern:</strong> 
                    ${analysis.commonPatterns[0].name} - ${analysis.commonPatterns[0].example}
                </div>
            `;
        }

        // Add parts of speech focus
        const posCount = Object.values(analysis.partsOfSpeech).reduce((sum, arr) => sum + arr.length, 0);
        if (posCount > 0) {
            focus += `
                <div class="grammar-point">
                    <strong>Parts of Speech:</strong> Found ${posCount} different grammatical elements to study
                </div>
            `;
        }

        return focus;
    }

    generatePracticeTips(analysis, language) {
        const langName = this.languageMap[language] || language;
        const sourceText = this.sourceText.value.trim();
        
        let tips = `
            <div class="grammar-tip">
                <strong>Practice Strategy:</strong> 
                Focus on ${analysis.tense.join(', ')} tense in ${langName}
            </div>
        `;

        // Add complexity-specific tips
        if (analysis.complexity === 'simple') {
            tips += `
                <div class="grammar-tip">
                    <strong>Beginner Tip:</strong> 
                    Start with basic ${analysis.sentenceType[0]} sentences. Master these before moving to complex structures.
                </div>
            `;
        } else if (analysis.complexity === 'moderate') {
            tips += `
                <div class="grammar-tip">
                    <strong>Intermediate Tip:</strong> 
                    Practice combining simple sentences into more complex ones using connectors like 'and', 'but', 'because'.
                </div>
            `;
        } else {
            tips += `
                <div class="grammar-tip">
                    <strong>Advanced Tip:</strong> 
                    Break down complex sentences into simpler parts to understand structure better.
                </div>
            `;
        }

        // Add pattern-specific tips
        if (analysis.commonPatterns.length > 0) {
            const pattern = analysis.commonPatterns[0];
            tips += `
                <div class="grammar-tip">
                    <strong>Pattern Practice:</strong> 
                    Create 5 new sentences using ${pattern.name} pattern: ${pattern.example}
                </div>
            `;
        }

        // Add content-specific tips based on actual text
        const contentTips = this.generateContentSpecificTips(sourceText, language, analysis);
        tips += contentTips;

        // Add general learning tips
        tips += `
            <div class="grammar-tip">
                <strong>Memory Technique:</strong> 
                Connect grammar rules to real examples from this text for better retention.
            </div>
            <div class="grammar-tip">
                <strong>Active Practice:</strong> 
                Try to rewrite this text using different tenses or sentence types.
            </div>
            <div class="grammar-tip">
                <strong>Consistency:</strong> 
                Practice ${langName} grammar for 15 minutes daily rather than long sessions.
            </div>
        `;

        return tips;
    }

    generateContentSpecificTips(text, language, analysis) {
        const langName = this.languageMap[language] || language;
        const lowerText = text.toLowerCase();
        let tips = '';

        // Check for personal information
        if (lowerText.includes('name') || lowerText.includes('my name') || lowerText.includes('i am') || lowerText.includes('i am')) {
            tips += `
                <div class="grammar-tip">
                    <strong>Personal Introduction Practice:</strong> 
                    Practice introducing yourself in ${langName} using different tenses: "I am...", "I was...", "I will be..."
                </div>
            `;
        }

        // Check for greetings
        if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey') || lowerText.includes('good morning')) {
            tips += `
                <div class="grammar-tip">
                    <strong>Greeting Practice:</strong> 
                    Learn different greetings for different times of day and situations in ${langName}.
                </div>
            `;
        }

        // Check for questions
        if (lowerText.includes('?') || lowerText.includes('what') || lowerText.includes('how') || lowerText.includes('where')) {
            tips += `
                <div class="grammar-tip">
                    <strong>Question Formation:</strong> 
                    Practice forming questions in ${langName} using WH-words and auxiliary verbs.
                </div>
            `;
        }

        // Check for descriptive words
        const descriptiveWords = ['good', 'bad', 'happy', 'sad', 'beautiful', 'nice', 'great', 'wonderful', 'terrible'];
        const hasDescriptive = descriptiveWords.some(word => lowerText.includes(word));
        
        if (hasDescriptive) {
            tips += `
                <div class="grammar-tip">
                    <strong>Adjective Practice:</strong> 
                    Practice using descriptive words in ${langName}. Try describing people, places, and objects.
                </div>
            `;
        }

        // Check for action words
        const actionWords = ['go', 'come', 'run', 'walk', 'eat', 'sleep', 'work', 'play', 'study', 'read'];
        const hasActionWords = actionWords.some(word => lowerText.includes(word));
        
        if (hasActionWords) {
            tips += `
                <div class="grammar-tip">
                    <strong>Verb Conjugation:</strong> 
                    Practice conjugating action verbs in ${langName} for different subjects (I, you, he/she, we, they).
                </div>
            `;
        }

        // Check for time references
        if (lowerText.includes('today') || lowerText.includes('yesterday') || lowerText.includes('tomorrow') || lowerText.includes('now')) {
            tips += `
                <div class="grammar-tip">
                    <strong>Time Expressions:</strong> 
                    Practice using time-related words in ${langName} with appropriate tenses.
                </div>
            `;
        }

        // Check for location words
        if (lowerText.includes('here') || lowerText.includes('there') || lowerText.includes('home') || lowerText.includes('school') || lowerText.includes('work')) {
            tips += `
                <div class="grammar-tip">
                    <strong>Prepositions of Place:</strong> 
                    Practice using prepositions like 'in', 'on', 'at', 'to' for locations in ${langName}.
                </div>
            `;
        }

        return tips;
    }

    updateCharCount() {
        const length = this.sourceText.value.length;
        this.charCount.textContent = `${length} / ${this.maxCharacters}`;
        
        if (length > this.maxCharacters) {
            this.charCount.style.color = '#dc3545';
            this.translateBtn.disabled = true;
        } else {
            this.charCount.style.color = '#6c757d';
            this.translateBtn.disabled = false;
        }
    }

    async translate() {
        const text = this.sourceText.value.trim();
        
        if (!text) {
            alert('Please enter text to translate');
            return;
        }

        if (text.length > this.maxCharacters) {
            alert(`Text exceeds maximum character limit of ${this.maxCharacters}`);
            return;
        }

        this.setLoading(true);
        this.detectedLanguage.style.display = 'none';

        try {
            // Use OpenRouter API for AI-powered translation
            const translation = await this.translateWithOpenRouter(
                text,
                this.sourceLanguage.value,
                this.targetLanguage.value
            );

            this.translatedText.value = translation.translatedText;
            
            if (translation.detectedLanguage && this.sourceLanguage.value === 'auto') {
                this.detectedLangName.textContent = this.languageMap[translation.detectedLanguage];
                this.detectedLanguage.style.display = 'block';
            }

            // Analyze translation and show insights
            const analysis = this.analyzeTranslation(text, translation.translatedText, translation.sourceLang, this.targetLanguage.value);
            this.updateTranslationInsights(analysis.confidence, analysis.tone);

            // Add to history
            this.addToHistory({
                originalText: text,
                translatedText: translation.translatedText,
                sourceLang: translation.sourceLang,
                targetLang: this.targetLanguage.value,
                timestamp: new Date().toISOString(),
                confidence: analysis.confidence,
                tone: analysis.tone
            });

        } catch (error) {
            console.error('Translation error:', error);
            if (error.message.includes('API key')) {
                alert('Please set your OpenRouter API key in localStorage: localStorage.setItem("openrouter_api_key", "your-key-here")');
            } else if (error.message.includes('quota')) {
                alert('API quota exceeded. Please check your OpenRouter account.');
            } else {
                alert('Translation failed: ' + error.message);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async translateWithOpenRouter(text, sourceLang, targetLang) {
        const apiKey = localStorage.getItem('openrouter_api_key') || this.getApiKey();
        
        if (!apiKey) {
            throw new Error('API key is required. Please set your OpenRouter API key.');
        }

        console.log('Available languages:', this.languageMap);
        console.log('Source lang:', sourceLang, 'Target lang:', targetLang);

        // Get language names - ensure they exist
        const sourceLangName = sourceLang === 'auto' ? 'auto-detected language' : (this.languageMap[sourceLang] || sourceLang);
        const targetLangName = this.languageMap[targetLang] || targetLang;

        console.log('Translating from', sourceLangName, 'to', targetLangName);

        const requestBody = {
            model: "openai/gpt-3.5-turbo", // Use a reliable paid model (small cost)
            messages: [
                { role: "user", content: `Translate the following ${sourceLangName} text to ${targetLangName}:\n\n${text}` }
            ]
        };

        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        try {
            console.log('Making API request...');
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.log('Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('API response:', data);

            const translatedText = data.choices?.[0]?.message?.content?.trim();

            if (!translatedText) {
                console.log('No translation found in response:', data);
                throw new Error('No translation received from API');
            }

            // Handle language detection for auto mode
            let detectedLanguage = sourceLang;
            if (sourceLang === 'auto') {
                detectedLanguage = this.detectLanguageFromText(text);
            }

            return {
                translatedText,
                sourceLang: detectedLanguage,
                detectedLanguage: sourceLang === 'auto' ? detectedLanguage : null
            };

        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error. Please check your internet connection.');
            }
            throw error;
        }
    }

    detectLanguageFromText(text) {
        // Simple language detection based on common patterns
        const patterns = {
            'es': /[ñáéíóúü¿¡]/i,
            'fr': /[àâäæçéèêëïîôùûüÿ]/i,
            'de': /[äöüß]/i,
            'it': /[àèéìíîòóù]/i,
            'pt': /[àâãáéêíóôõú]/i,
            'ru': /[а-я]/i,
            'ja': /[\u3040-\u309f\u30a0-\u30ff]/,
            'ko': /[\uac00-\ud7af]/,
            'zh': /[\u4e00-\u9fff]/,
            'ar': /[\u0600-\u06ff]/,
            'hi': /[\u0900-\u097f]/,
            'te': /[\u0c00-\u0c7f]/, // Telugu characters
            'ta': /[\u0b80-\u0bff]/, // Tamil characters
            'bn': /[\u0980-\u09ff]/, // Bengali characters
            'gu': /[\u0a80-\u0aff]/, // Gujarati characters
            'mr': /[\u0900-\u097f]/, // Marathi (same range as Hindi)
            'pa': /[\u0a00-\u0a7f]/, // Punjabi characters
            'ml': /[\u0d00-\u0d7f]/, // Malayalam characters
            'kn': /[\u0c80-\u0cff]/, // Kannada characters
            'or': /[\u0b00-\u0b7f]/, // Oriya characters
            'as': /[\u0980-\u09ff]/, // Assamese (same as Bengali)
        };

        for (const [lang, pattern] of Object.entries(patterns)) {
            if (pattern.test(text)) {
                return lang;
            }
        }

        return 'en'; // Default to English if no patterns match
    }

    getApiKey() {
        // Try to get API key from environment or prompt user
        const savedKey = localStorage.getItem('openrouter_api_key');
        if (savedKey) return savedKey;

        // For demo purposes, you can set a default key here
        // In production, this should be handled more securely
        return null;
    }

    swapLanguages() {
        const tempLang = this.sourceLanguage.value;
        const tempText = this.sourceText.value;
        
        this.sourceLanguage.value = this.targetLanguage.value;
        this.targetLanguage.value = tempLang;
        
        this.sourceText.value = this.translatedText.value;
        this.translatedText.value = tempText;
        
        this.updateCharCount();
        this.detectedLanguage.style.display = 'none';
    }

    clearText() {
        this.sourceText.value = '';
        this.translatedText.value = '';
        this.updateCharCount();
        this.detectedLanguage.style.display = 'none';
    }

    async copyTranslation() {
        if (!this.translatedText.value) {
            alert('No translation to copy');
            return;
        }

        try {
            await navigator.clipboard.writeText(this.translatedText.value);
            this.copyBtn.textContent = '✓ Copied';
            setTimeout(() => {
                this.copyBtn.textContent = '📋 Copy';
            }, 2000);
        } catch (error) {
            console.error('Copy failed:', error);
            alert('Failed to copy translation');
        }
    }

    speakTranslation() {
        if (!this.translatedText.value) {
            alert('No translation to speak');
            return;
        }

        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(this.translatedText.value);
            
            // Set language based on target language
            const langCode = this.getSpeechLanguageCode(this.targetLanguage.value);
            if (langCode) {
                utterance.lang = langCode;
            }
            
            speechSynthesis.speak(utterance);
            
            this.speakBtn.textContent = '🔊 Speaking...';
            setTimeout(() => {
                this.speakBtn.textContent = '🔊 Speak';
            }, 3000);
        } else {
            alert('Speech synthesis is not supported in your browser');
        }
    }

    getSpeechLanguageCode(langCode) {
        const speechLangMap = {
            'en': 'en-US',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'it': 'it-IT',
            'pt': 'pt-PT',
            'ru': 'ru-RU',
            'ja': 'ja-JP',
            'ko': 'ko-KR',
            'zh': 'zh-CN',
            'ar': 'ar-SA',
            'hi': 'hi-IN'
        };
        return speechLangMap[langCode] || 'en-US';
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.translateBtn.disabled = true;
            this.btnText.style.display = 'none';
            this.loadingSpinner.style.display = 'inline-block';
        } else {
            this.translateBtn.disabled = false;
            this.btnText.style.display = 'inline';
            this.loadingSpinner.style.display = 'none';
        }
    }

    addToHistory(translation) {
        let history = JSON.parse(localStorage.getItem('translationHistory') || '[]');
        history.unshift(translation);
        
        // Keep only last 50 translations
        if (history.length > 50) {
            history = history.slice(0, 50);
        }
        
        localStorage.setItem('translationHistory', JSON.stringify(history));
        this.renderHistory();
    }

    loadHistory() {
        this.renderHistory();
    }

    renderHistory() {
        const history = JSON.parse(localStorage.getItem('translationHistory') || '[]');
        
        if (history.length === 0) {
            this.historyList.innerHTML = '<p class="no-history">No translations yet</p>';
            return;
        }

        this.historyList.innerHTML = history.map((item, index) => `
            <div class="history-item">
                <div class="languages">
                    ${(this.languageMap[item.sourceLang] || item.sourceLang)} → ${(this.languageMap[item.targetLang] || item.targetLang)}
                </div>
                <div class="original-text">${this.escapeHtml(item.originalText)}</div>
                <div class="translated-text">${this.escapeHtml(item.translatedText)}</div>
                <div class="timestamp">${new Date(item.timestamp).toLocaleString()}</div>
            </div>
        `).join('');
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all translation history?')) {
            localStorage.removeItem('translationHistory');
            this.renderHistory();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the translator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AITranslator();
});
