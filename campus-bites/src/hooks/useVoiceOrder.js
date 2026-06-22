import { useState, useCallback, useRef } from 'react';

const parseVoiceCommand = (transcript, products) => {
    const lower = transcript.toLowerCase();
    const matched = [];
    const qtyWords = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };

    for (const product of products) {
        const name = product.name.toLowerCase();
        if (lower.includes(name)) {
            let qty = 1;
            for (const [word, num] of Object.entries(qtyWords)) {
                if (lower.includes(`${word} ${name}`) || lower.includes(`${num} ${name}`)) {
                    qty = num;
                    break;
                }
            }
            const numMatch = lower.match(new RegExp(`(\\d+)\\s*${name}`));
            if (numMatch) qty = parseInt(numMatch[1]);
            matched.push({ product, quantity: qty });
        }
    }

    const pickupMatch = lower.match(/(?:at|pickup|for)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    const pickupTime = pickupMatch ? pickupMatch[1] : null;

    return { items: matched, pickupTime };
};

export const useVoiceOrder = (products, onResult) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef(null);

    const startListening = useCallback(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Voice recognition not supported in this browser');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognition.onresult = (event) => {
            const text = Array.from(event.results).map(r => r[0].transcript).join('');
            setTranscript(text);

            if (event.results[0].isFinal) {
                const parsed = parseVoiceCommand(text, products);
                if (parsed.items.length > 0) {
                    onResult(parsed);
                }
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [products, onResult]);

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
        setIsListening(false);
    }, []);

    return { isListening, transcript, startListening, stopListening };
};
