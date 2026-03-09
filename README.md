# AI Language Translator

A modern, responsive web application for translating text between multiple languages using AI technology powered by OpenRouter.

## Features

- **AI-Powered Translation**: Uses OpenRouter's LLM API for high-quality translations
- **Multi-language Support**: Translate between 43 languages including English, Spanish, French, German, Chinese, Japanese, Arabic, Hindi, and many more
- **Auto Language Detection**: Automatically detects the source language
- **Real-time Translation**: Fast translation with loading indicators
- **Translation History**: Keeps track of your recent translations
- **Text-to-Speech**: Listen to translated text
- **Copy to Clipboard**: Quick copy functionality
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradient design with smooth animations
- **API Key Management**: Secure local storage of your OpenRouter API key

## Supported Languages (43 Total)

### Major World Languages
- English, Spanish, French, German, Italian, Portuguese
- Russian, Chinese (Simplified), Japanese, Korean
- Arabic, Hindi

### Indian Regional Languages
- Telugu, Tamil, Bengali, Gujarati, Marathi
- Punjabi, Malayalam, Kannada, Oriya, Assamese

### European Languages
- Dutch, Swedish, Norwegian, Danish, Finnish
- Polish, Czech, Ukrainian, Greek

### Middle Eastern & Asian Languages
- Turkish, Hebrew, Urdu, Persian
- Vietnamese, Thai, Indonesian, Malay

### African Languages
- Swahili

## Getting Started

### Prerequisites

1. **Get an OpenRouter API Key**:
   - Visit [OpenRouter.ai](https://openrouter.ai)
   - Sign up for an account
   - Navigate to the API keys section
   - Create a new API key (starts with `sk-or-v1-`)

2. **Clone or download the project files**

### Running the Application

1. Open `index.html` in your web browser
2. Enter your OpenRouter API key in the input field at the top
3. Click "Save Key" - the key will be stored locally
4. Start translating!

## How to Use

1. **Set API Key**: Enter your OpenRouter API key and save it
2. **Select Languages**: Choose source and target languages from the dropdown menus
3. **Enter Text**: Type or paste text in the source text area
4. **Translate**: Click the "Translate" button or press `Ctrl+Enter`
5. **View Results**: See the translated text in the output area
6. **Additional Features**:
   - Click "⇄" to swap languages
   - Click "📋 Copy" to copy translation
   - Click "🔊 Speak" to hear the translation
   - View translation history at the bottom

## Technical Details

### Frontend Stack
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with gradients and animations
- **JavaScript (ES6+)**: Vanilla JavaScript with modern features
- **Web APIs**: Speech Synthesis API for text-to-speech

### API Integration
- **OpenRouter API**: Uses Claude 3 Haiku model for translations
- **Secure Storage**: API keys stored in localStorage
- **Error Handling**: Comprehensive error handling for API failures
- **Rate Limiting**: Built-in handling for API quota limits

### Key Features Implementation
- **Local Storage**: Translation history and API key persistence
- **Responsive Grid Layout**: Adapts to different screen sizes
- **Character Limit**: 5000 characters per translation
- **Loading States**: Visual feedback during translation
- **Language Detection**: Pattern-based language detection for auto mode

### File Structure
```
project/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and animations
├── script.js           # JavaScript functionality with OpenRouter integration
└── README.md           # Project documentation
```

## API Configuration

### Setting up OpenRouter

1. **Create Account**: Sign up at [OpenRouter.ai](https://openrouter.ai)
2. **Get API Key**: Generate an API key from your dashboard
3. **Add Credits**: Add credits to your account for API usage
4. **Configure App**: Enter your API key in the translator

### API Usage

The application uses the following OpenRouter endpoint:
```
POST https://openrouter.ai/api/v1/chat/completions
```

**Model**: `anthropic/claude-3-haiku` (fast and cost-effective)
**Temperature**: 0.3 (for consistent translations)
**Max Tokens**: Dynamic based on input length

### Cost Estimation

Claude 3 Haiku pricing (as of 2024):
- **Input**: ~$0.25 per 1M tokens
- **Output**: ~$1.25 per 1M tokens

Average translation cost: ~$0.001-0.01 per translation

## Customization

### Adding New Languages

To add more languages, update the `languageMap` object in `script.js`:

```javascript
this.languageMap = {
    // existing languages...
    'new-lang-code': 'New Language Name'
};
```

### Changing the AI Model

You can change the model in the `translateWithOpenRouter` method:

```javascript
const requestBody = {
    model: "anthropic/claude-3-sonnet", // Change model here
    // ... rest of configuration
};
```

Available models include:
- `anthropic/claude-3-haiku` (fast, cheap)
- `anthropic/claude-3-sonnet` (balanced)
- `anthropic/claude-3-opus` (high quality)
- `openai/gpt-4-turbo`
- `google/gemini-pro`

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Security Considerations

- **API Key Storage**: Keys are stored in localStorage (client-side)
- **HTTPS Recommended**: Use HTTPS in production for security
- **No Server Storage**: No API keys are sent to external servers except OpenRouter

## Troubleshooting

### Common Issues

1. **"Invalid API Key"**:
   - Ensure your key starts with `sk-or-v1-`
   - Check if the key has credits
   - Verify the key is correctly saved

2. **"API Quota Exceeded"**:
   - Add more credits to your OpenRouter account
   - Check your usage statistics

3. **"Network Error"**:
   - Check your internet connection
   - Verify OpenRouter service status

4. **Slow Translations**:
   - Try switching to a faster model (haiku)
   - Check your network latency

## Future Enhancements

- [ ] Support for more AI models
- [ ] Batch translation for multiple texts
- [ ] Voice input for source text
- [ ] Download translation history
- [ ] Dark mode toggle
- [ ] Keyboard shortcuts
- [ ] Translation confidence scores
- [ ] Custom translation prompts
- [ ] API usage statistics
- [ ] Model selection interface

## License

This project is open source and available under the MIT License.

---

**Note**: This application requires an OpenRouter API key and credits to function. The API key is stored locally and never shared with third parties.
