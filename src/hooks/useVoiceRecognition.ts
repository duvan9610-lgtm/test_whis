import { useState, useCallback, useEffect } from 'react';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';

export const useVoiceRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [text, setText] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Setup Voice listeners
        Voice.onSpeechStart = () => setIsListening(true);
        Voice.onSpeechEnd = () => setIsListening(false);
        Voice.onSpeechResults = (e: SpeechResultsEvent) => {
            if (e.value && e.value.length > 0) {
                setText(e.value[0]);
            }
        };
        Voice.onSpeechError = (e: SpeechErrorEvent) => {
            setError(e.error?.message || 'Error desconocido');
            setIsListening(false);
        };

        return () => {
            // Cleanup
            Voice.destroy().then(Voice.removeAllListeners);
        };
    }, []);

    const start = useCallback(async () => {
        try {
            setError(null);
            setText('');
            await Voice.start('es-ES');
        } catch (e) {
            console.error(e);
            setError('Error al iniciar el micrófono');
        }
    }, []);

    const stop = useCallback(async () => {
        try {
            await Voice.stop();
        } catch (e) {
            console.error(e);
        }
    }, []);

    return {
        isListening,
        text,
        error,
        start,
        stop,
        setText // Exposed to manually clear text if needed
    };
};
